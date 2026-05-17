interface SubToolbarProps {
  activeTab: 'feed' | 'profile';
}

export function SubToolbar({ activeTab }: SubToolbarProps) {
  if (activeTab === 'feed') {
    return (
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2">
            ✏️ Create Post
          </button>

          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search posts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>

          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
            ⚙️ Filter
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
