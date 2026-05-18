import { useState } from 'react';
import { userService } from '../services/userService';

interface SubToolbarProps {
  activeTab: 'feed' | 'profile';
  onSearch?: (searchText: string, userId: string | null) => void;
}

interface User {
  _id: string;
  name: string;
}

export function SubToolbar({ activeTab, onSearch }: SubToolbarProps) {
  const [searchText, setSearchText] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [prevCursors, setPrevCursors] = useState<string[]>([]);

  const handleSearchAuthorChange = async (value: string) => {
    setSearchAuthor(value);
    setCurrentQuery(value);
    if (value.trim()) {
      try {
        const result = await userService.searchUsers(value);
        setUserSuggestions(result.users);
        setNextCursor(result.nextCursor);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setUserSuggestions([]);
        setNextCursor(null);
      }
    } else {
      setUserSuggestions([]);
      setShowSuggestions(false);
      setSelectedUserId(null);
      setNextCursor(null);
    }
  };

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nextCursor || !currentQuery.trim()) return;
    try {
      console.log('📄 Loading more users with cursor:', nextCursor);
      setPrevCursors([...prevCursors, nextCursor]);
      const result = await userService.searchUsers(currentQuery, nextCursor);
      console.log('✅ Received users:', result.users.length, 'nextCursor:', result.nextCursor);
      setUserSuggestions(result.users);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading more users:', error);
    }
  };

  const handleLoadPrev = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (prevCursors.length === 0 || !currentQuery.trim()) return;
    try {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop();
      if (!prevCursor) return;
      setPrevCursors(newPrevCursors);
      console.log('⬅️ Loading previous users with cursor:', prevCursor);
      const result = await userService.searchUsers(currentQuery, prevCursor);
      console.log('✅ Received users:', result.users.length, 'nextCursor:', result.nextCursor);
      setUserSuggestions(result.users);
      setNextCursor(prevCursor);
    } catch (error) {
      console.error('Error loading previous users:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    setSearchAuthor(user.name);
    setSelectedUserId(user._id);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = () => {
    onSearch?.(searchText.trim(), selectedUserId);
  };

  const handleClear = () => {
    setSearchText('');
    setSearchAuthor('');
    setSelectedUserId(null);
    setUserSuggestions([]);
    setShowSuggestions(false);
    setPrevCursors([]);
    setNextCursor(null);
    setCurrentQuery('');
    onSearch?.('', null);
  };

  if (activeTab === 'feed') {
    return (
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2">
            ✏️ Create Post
          </button>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="🔍 Search posts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="👤 Search users..."
                value={searchAuthor}
                onChange={(e) => handleSearchAuthorChange(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSuggestions && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {userSuggestions.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      {user.name}
                    </div>
                  ))}
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
                </div>
              )}
            </div>
          </div>

          <button
            onClick={performSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            🔍 Search
          </button>

          <button
            onClick={handleClear}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
          >
            ✕ Clear
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
            ✏️ Edit Profile
          </button>

          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-2">
            ⚙️ Settings
          </button>

          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center gap-2">
            🔒 Privacy
          </button>
        </div>
      </div>
    );
  }

  return null;
}
