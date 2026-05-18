import { useState } from 'react';
import { TopNavbar } from '../components/TopNavbar';
import { SubToolbar } from '../components/SubToolbar';
import { FeedContent } from '../components/FeedContent';
import { ProfileContent } from '../components/ProfileContent';
import CreatePostModal from '../components/CreatePostModal';
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
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [editingPost, setEditingPost] = useState<{ _id: string; content: string } | null>(null);

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
      const postsWithAIFlag = posts.map((post) => ({
        ...post,
        _aiRecommended: true,
      }));
      setAiRecommendations(postsWithAIFlag);
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

  const handlePostCreated = () => {
    setFeedRefreshKey((prev) => prev + 1);
    setIsAIMode(false);
    setAiRecommendations([]);
  };

  const handleEditPostClick = async (post: Post) => {
    try {
      const fullPost = await postService.getPostById(post._id);
      setEditingPost({ _id: fullPost._id, content: fullPost.content });
      setIsCreatePostOpen(true);
    } catch (error) {
      console.error('Error loading post for editing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      <SubToolbar
        activeTab={activeTab}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        isAIMode={isAIMode}
        isLoadingAI={isLoadingAI}
        onSearch={handleSearch}
        onAllPosts={handleAllPosts}
        onAIRecommendations={handleAIRecommendations}
        onCreatePost={() => setIsCreatePostOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'feed' && (
          <FeedContent
            key={feedRefreshKey}
            searchText={searchText}
            searchAuthor={selectedUserId}
            aiPosts={aiRecommendations}
            onEditPost={handleEditPostClick}
          />
        )}
        {activeTab === 'profile' && <ProfileContent />}
      </main>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => {
          setIsCreatePostOpen(false);
          setEditingPost(null);
        }}
        onPostCreated={handlePostCreated}
        editingPost={editingPost}
      />
    </div>
  );
}
