import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TopNavbar } from '../components/TopNavbar';
import { SubToolbar } from '../components/SubToolbar';
import { FeedContent } from '../components/FeedContent';
import { ProfileContent } from '../components/ProfileContent';
import type { Post } from '../services/postService';
import postService from '../services/postService';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');
  const [searchText, setSearchText] = useState('');
  const [searchAuthor, setSearchAuthor] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Post[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleTabChange = (tab: 'feed' | 'profile') => {
    setActiveTab(tab);
  };

  const handleSearch = (text: string, userId: string | null) => {
    setSearchText(text);
    setSelectedUserId(userId);
    setIsAIMode(false);
    setAiRecommendations([]);
  };

  const handleAIRecommendations = async () => {
    setIsLoadingAI(true);
    setIsAIMode(true);
    try {
      const posts = await postService.getRecommendedPosts();
      setAiRecommendations(posts);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setAiRecommendations([]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAllPosts = () => {
    setIsAIMode(false);
    setAiRecommendations([]);
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

      <SubToolbar
        activeTab={activeTab}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        isAIMode={isAIMode}
        onSearch={handleSearch}
        onAllPosts={handleAllPosts}
        onAIRecommendations={handleAIRecommendations}
      />

      <main className="flex-1">
        {activeTab === 'feed' && (
          <FeedContent
            searchText={searchText}
            searchAuthor={selectedUserId}
            aiPosts={aiRecommendations}
          />
        )}
        {activeTab === 'profile' && <ProfileContent />}
      </main>
    </div>
  );
}
