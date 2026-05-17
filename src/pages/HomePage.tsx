import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TopNavbar } from '../components/TopNavbar';
import { SubToolbar } from '../components/SubToolbar';
import { FeedContent } from '../components/FeedContent';
import { ProfileContent } from '../components/ProfileContent';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleTabChange = (tab: 'feed' | 'profile') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 z-10"
      >
        Logout
      </button>

      <SubToolbar activeTab={activeTab} />

      <main className="flex-1">
        {activeTab === 'feed' && <FeedContent />}
        {activeTab === 'profile' && <ProfileContent />}
      </main>
    </div>
  );
}
