import { useState, useEffect } from 'react';
import postService from '../services/postService';
import type { Post } from '../services/postService';
import { PostActions } from './PostActions';
import { CommentsSection } from './CommentsSection';
import { fetchLikesStats } from '../services/likesService';

interface PostDetailModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PostDetailModal({ postId, isOpen, onClose }: PostDetailModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [likesStats, setLikesStats] = useState({ total: 0, like: 0, love: 0, celebrate: 0, insightful: 0 });
  const [commentsCount, setCommentsCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadPost();
    }
  }, [isOpen, postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const fullPost = await postService.getPostById(postId);
      setPost(fullPost);
      setCommentsCount(fullPost.commentsCount || 0);
      setFilesCount(fullPost.filesCount || 0);
      await loadLikesStats();
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLikesStats = async () => {
    try {
      const stats = await fetchLikesStats(postId, 'post');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Loading post...</div>
          </div>
        ) : post ? (
          <div className="p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${colors[getColorIndex(typeof post.userId === 'object' ? post.userId._id : String(post.userId || ''))]} rounded-full flex items-center justify-center text-white font-bold`}>
                {getInitial(typeof post.userId === 'object' ? post.userId.name : 'Unknown User')}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {typeof post.userId === 'object' ? post.userId.name : 'Unknown User'}
                </div>
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
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Failed to load post</div>
          </div>
        )}
      </div>
    </div>
  );
}
