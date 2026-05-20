import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import postService from '../services/postService';
import { friendService } from '../services/friendService';
import { AuthContext } from '../contexts/AuthContext';
import { TopNavbar } from '../components/TopNavbar';
import { PostCard } from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import type { Post } from '../services/postService';

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  domainofinterest?: string[];
  createdAt?: string;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUserPosts, setAllUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<{ _id: string; content: string } | null>(null);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestError, setFriendRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserPosts();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!userId) return;

    setPostsLoading(true);
    try {
      const userPosts = await postService.getPostsByUser(userId);
      setAllUserPosts(userPosts);
      setPosts(userPosts.slice(0, 4));
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLoadMorePosts = async () => {
    setPostsLoading(true);
    try {
      const nextBatch = posts.length + 4;
      setPosts(allUserPosts.slice(0, nextBatch));
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleEditPost = async (post: Post) => {
    try {
      const fullPost = await postService.getPostById(post._id);
      setEditingPost({ _id: fullPost._id, content: fullPost.content });
      setIsCreatePostOpen(true);
    } catch (error) {
      console.error('Error loading post for editing:', error);
    }
  };

  const handlePostUpdated = () => {
    loadUserPosts();
  };

  const handleSendFriendRequest = async () => {
    if (!userId) return;

    setFriendRequestLoading(true);
    setFriendRequestError(null);
    try {
      await friendService.sendFriendRequest(userId);
      setFriendRequestSent(true);
    } catch (err) {
      setFriendRequestError(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setFriendRequestLoading(false);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const colors = [
    'from-blue-400 to-blue-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-orange-400 to-orange-600',
  ];

  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % colors.length;
  };

  const colorIndex = profile ? getColorIndex(profile._id) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar activeTab="profile" onTabChange={() => {}} />

      <div className="max-w-3xl mx-auto py-8 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Loading profile...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Feed
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Back Button - Top Left */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ← Back to Feed
              </button>
            </div>

            {/* Friend Request Error */}
            {friendRequestError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                {friendRequestError}
              </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Cover Background with Profile Info */}
              <div className="h-56 bg-gradient-to-r from-blue-400 to-purple-600 rounded-t-lg relative flex items-end p-8">
                {/* Avatar */}
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg`}
                >
                  {getInitial(profile.name)}
                </div>

                {/* User Info in Blue Area */}
                <div className="flex-1 ml-8 text-white mb-2">
                  <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-blue-100 text-lg">{profile.email}</p>
                </div>

                {/* FRIEND Button */}
                {authContext?.user?.id !== userId && (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={friendRequestLoading || friendRequestSent}
                    className={`ml-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                      friendRequestSent
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white text-blue-600 hover:bg-gray-100'
                    } ${friendRequestLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {friendRequestLoading ? 'Sending...' : friendRequestSent ? '✓ Sent' : 'FRIEND'}
                  </button>
                )}
              </div>

              {/* Profile Details Grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Member Since Section */}
                  {profile.createdAt && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Member Since
                      </label>
                      <p className="text-lg text-gray-800 mt-2">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Domains of Interest Section */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Domains of Interest
                    </label>
                    {profile.domainofinterest && profile.domainofinterest.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.domainofinterest.map((domain, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-2">No domains of interest specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Posts Section */}
            {posts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Posts</h2>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onEditPost={handleEditPost}
                      hideActions={true}
                    />
                  ))}
                </div>

                {posts.length < allUserPosts.length && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMorePosts}
                      disabled={postsLoading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {postsLoading ? 'Loading...' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <CreatePostModal
              isOpen={isCreatePostOpen}
              onClose={() => {
                setIsCreatePostOpen(false);
                setEditingPost(null);
              }}
              onPostCreated={handlePostUpdated}
              editingPost={editingPost}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
