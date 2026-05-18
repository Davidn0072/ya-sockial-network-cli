import { useState } from 'react';
import { userService } from '../services/userService';

interface SubToolbarProps {
  activeTab: 'feed' | 'profile';
  onSearch?: (searchText: string, userId: string | null) => void;
}

export function SubToolbar({ activeTab, onSearch }: SubToolbarProps) {
  const [searchText, setSearchText] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = async () => {
    let userId: string | null = null;
    if (searchAuthor.trim()) {
      userId = await userService.resolveUserIdFromUsername(searchAuthor.trim());
    }
    onSearch?.(searchText.trim(), userId);
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
            <input
              type="text"
              placeholder="👤 Search users..."
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              onKeyDown={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={performSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            🔍 Search
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
