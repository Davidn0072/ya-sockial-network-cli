import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import postService from '../services/postService';
import { TopNavbar } from '../components/TopNavbar';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setPosts(userPosts.slice(0, 4));
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLoadMorePosts = async () => {
    if (!userId) return;

    setPostsLoading(true);
    try {
      const userPosts = await postService.getPostsByUser(userId);
      setPosts(userPosts.slice(0, posts.length + 4));
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setPostsLoading(false);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 cursor-pointer"
                    >
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="text-gray-800 text-sm line-clamp-3 mb-4">
                        {post.content}
                      </p>
                      {post.images && post.images.length > 0 && (
                        <div className="mb-4 h-40 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`${window.location.protocol}//${window.location.hostname}:3000/uploads/${post.images[0]}`}
                            alt="post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600">
                        {post.likesStats && (
                          <span>👍 {post.likesStats.total || 0}</span>
                        )}
                        {post.commentsCount !== undefined && (
                          <span>💬 {post.commentsCount}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {posts.length > 0 && (
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
          </>
        ) : null}
      </div>
    </div>
  );
}
