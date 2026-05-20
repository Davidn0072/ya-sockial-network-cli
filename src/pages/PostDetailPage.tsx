import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import type { Post } from '../services/postService';
import { TopNavbar } from '../components/TopNavbar';
import { PostActions } from '../components/PostActions';
import { CommentsSection } from '../components/CommentsSection';
import { fetchLikesStats } from '../services/likesService';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [likesStats, setLikesStats] = useState({ total: 0, like: 0, love: 0, celebrate: 0, insightful: 0 });
  const [commentsCount, setCommentsCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await postService.getPostWithDetails(postId!);
      setPost(data.post);
      setCommentsCount(data.post.commentsCount || 0);
      setFilesCount(data.post.filesCount || 0);
      setLikesStats(data.post.likesStats || { total: 0, like: 0, love: 0, celebrate: 0, insightful: 0 });
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLikesStats = async () => {
    try {
      const stats = await fetchLikesStats(postId!, 'post');
      if (stats) {
        setLikesStats({
          total: stats.total || 0,
          like: stats.like || 0,
          love: stats.love || 0,
          celebrate: stats.celebrate || 0,
          insightful: stats.insightful || 0
        });
      }
    } catch (err) {
      console.error('Error loading likes stats:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitial = (name?: string) => {
    return (name || 'U').charAt(0).toUpperCase();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar activeTab="feed" onTabChange={() => {}} />

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Back
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Loading post...</div>
          </div>
        ) : post ? (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${colors[getColorIndex(typeof post.userId === 'object' ? post.userId._id : String(post.userId || ''))]} rounded-full flex items-center justify-center text-white font-bold cursor-pointer`} onClick={() => navigate(`/user/${typeof post.userId === 'object' ? post.userId._id : String(post.userId || '')}`)}>
                {getInitial(typeof post.userId === 'object' ? post.userId.name : 'Unknown User')}
              </div>
              <div>
                <button
                  onClick={() => navigate(`/user/${typeof post.userId === 'object' ? post.userId._id : String(post.userId || '')}`)}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {typeof post.userId === 'object' ? post.userId.name : 'Unknown User'}
                </button>
                <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-gray-800 mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4">
                {post.images.length === 1 ? (
                  <img src={`${window.location.protocol}//${window.location.hostname}:3000/uploads/${post.images[0]}`} alt="post" className="w-full rounded-lg max-h-96 object-cover" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.slice(0, 4).map((img, idx) => (
                      <img key={idx} src={`${window.location.protocol}//${window.location.hostname}:3000/uploads/${img}`} alt={`post-${idx}`} className="w-full rounded-lg h-48 object-cover" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post Actions */}
            <PostActions
              postId={post._id}
              likesStats={likesStats}
              commentsCount={commentsCount}
              filesCount={filesCount}
              onReactionSuccess={loadLikesStats}
              onViewReactions={() => {}}
              onCommentIconClick={() => {
                setShowComments(true);
              }}
              onCommentCountClick={() => {
                setShowComments(!showComments);
              }}
              onFileIconClick={() => {}}
              onFilesClick={() => {}}
            />

            {/* Comments Section */}
            {showComments && (
              <CommentsSection
                postId={post._id}
                focusInput={false}
                onFocusHandled={() => {}}
                onCommentAdded={() => setCommentsCount(prev => prev + 1)}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-center">
            <p className="text-gray-600">Failed to load post</p>
          </div>
        )}
      </div>
    </div>
  );
}
