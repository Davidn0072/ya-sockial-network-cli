import { useEffect, useRef, useState } from 'react';
import { userService } from '../services/userService';

interface User {
  _id: string;
  name: string;
  email?: string;
}

interface UserSearchDropdownProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  autoFocus?: boolean;
  listOffsetUp?: number;
}

export function UserSearchDropdown({
  onUserSelect,
  placeholder = '👤 Search users...',
  autoFocus = false,
  listOffsetUp = 0,
}: UserSearchDropdownProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([]);

  useEffect(() => {
    if (!autoFocus) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [autoFocus]);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 1) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      setNextCursor(null);
      setCurrentCursor(null);
      setPrevCursors([]);
      return;
    }

    try {
      const result = await userService.searchUsers(value);
      setUserSuggestions(result.users || []);
      setNextCursor(result.nextCursor || null);
      setCurrentCursor(null);
      setPrevCursors([]);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nextCursor || !searchQuery.trim()) return;

    try {
      setPrevCursors([...prevCursors, currentCursor]);
      const result = await userService.searchUsers(searchQuery, nextCursor);
      setUserSuggestions(result.users || []);
      setCurrentCursor(nextCursor);
      setNextCursor(result.nextCursor || null);
    } catch (error) {
      console.error('Error loading more users:', error);
    }
  };

  const handleLoadPrev = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (prevCursors.length === 0 || !searchQuery.trim()) return;

    try {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop();
      if (prevCursor === undefined) return;
      setPrevCursors(newPrevCursors);
      const result = await userService.searchUsers(searchQuery, prevCursor);
      setUserSuggestions(result.users || []);
      setCurrentCursor(prevCursor);
      setNextCursor(result.nextCursor || null);
    } catch (error) {
      console.error('Error loading previous users:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchQuery('');
    setUserSuggestions([]);
    setShowSuggestions(false);
    setNextCursor(null);
    setCurrentCursor(null);
    setPrevCursors([]);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showSuggestions && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
          style={listOffsetUp ? { transform: `translateY(-${listOffsetUp}px)` } : undefined}
          onMouseDown={(e) => e.preventDefault()}
        >
          {userSuggestions.length > 0 ? (
            <>
              <div className="max-h-[420px] overflow-y-auto">
                {userSuggestions.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className="px-3 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  >
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-600 leading-tight">{user.email}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 px-2 py-2">
                <button
                  onClick={prevCursors.length > 0 ? handleLoadPrev : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  disabled={prevCursors.length === 0}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`flex-1 px-3 py-2 font-medium text-sm rounded ${
                    prevCursors.length > 0
                      ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  ← PREV
                </button>
                <button
                  onClick={nextCursor ? handleLoadMore : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  disabled={!nextCursor}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`flex-1 px-3 py-2 font-medium text-sm rounded ${
                    nextCursor
                      ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  {nextCursor ? 'NEXT →' : 'No more'}
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center text-sm">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
