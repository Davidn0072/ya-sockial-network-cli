interface TopNavbarProps {
  activeTab: 'feed' | 'profile';
  onTabChange: (tab: 'feed' | 'profile') => void;
}

export function TopNavbar({ activeTab, onTabChange }: TopNavbarProps) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">SockNetwork</div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => onTabChange('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'feed'
                ? 'bg-white text-blue-600 font-bold'
                : 'hover:bg-blue-500'
            }`}
          >
            🏠 Feed
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 font-bold'
                : 'hover:bg-blue-500'
            }`}
          >
            👤 Profile
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-600 transition">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
