import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../services/postService';
import postService from '../services/postService';
import { PostActions } from './PostActions';
import { FilesGrid } from './FilesGrid';
import LikesPopup from './LikesPopup';
import { CommentsSection } from './CommentsSection';
import { fetchLikesStats } from '../services/likesService';
import FileUploadModal from './FileUploadModal';

interface PostCardProps {
  post: Post;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  hideActions?: boolean;
}

export function PostCard({ post, onEditPost, onDeletePost, hideActions = false }: PostCardProps) {
  const navigate = useNavigate();
  const [content, setContent] = useState(post.content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [focusCommentInput, setFocusCommentInput] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [filesCount, setFilesCount] = useState(post.filesCount || 0);
  const [likesStats, setLikesStats] = useState(post.likesStats || { total: 0, like: 0, love: 0, celebrate: 0, insightful: 0 });
  const [isLikesPopupOpen, setIsLikesPopupOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadLikesStats();
  }, [post._id]);

  const loadLikesStats = async () => {
    try {
      const stats = await fetchLikesStats(post._id, 'post');
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

  const handleShowMore = async () => {
    try {
      console.log('Loading full content for post:', post._id);
      const fullPost = await postService.getPostById(post._id);
      setContent(fullPost.content);
      setIsExpanded(true);
    } catch (err) {
      console.error('Error loading full content:', err);
    }
  };

  const handleDeletePost = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await postService.deletePost(post._id);
      onDeletePost?.(post._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      alert(errorMessage);
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

  const userIdString = typeof post.userId === 'object' ? post.userId._id : String(post.userId || '');

  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % colors.length;
  };

  const colorIndex = getColorIndex(userIdString);
  const userName = typeof post.userId === 'object' ? post.userId.name : 'Unknown User';

  return (
    <div className={`bg-white rounded-lg p-6 flex flex-col h-full ${hideActions ? 'shadow-sm border border-gray-200' : 'shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100'}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity`} onClick={() => navigate(`/user/${userIdString}`)}>
            {getInitial(userName)}
          </div>
          <div>
            <button
              onClick={() => navigate(`/user/${userIdString}`)}
              className="font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {userName}
            </button>
            <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {(post as any)._aiRecommended && (
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            ✨ AI Pick
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className={`mb-4 ${hideActions ? 'bg-gray-50 p-3 rounded text-gray-800' : 'text-gray-800'}`}>
        {post.hasMore && !isExpanded ? (
          <p>
            {content}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hideActions) {
                  e.stopPropagation();
                }
                handleShowMore();
              }}
              className="text-blue-500 hover:underline font-bold cursor-pointer"
            >
              {' '}MORE...
            </a>
          </p>
        ) : (
          <p>{content}</p>
        )}
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
      <div className="mt-auto">
        {!hideActions ? (
          <PostActions
          postId={post._id}
          likesStats={likesStats}
          commentsCount={commentsCount}
          filesCount={filesCount}
          onReactionSuccess={loadLikesStats}
          onViewReactions={() => setIsLikesPopupOpen(true)}
          onCommentIconClick={() => {
            setShowComments(true);
            setShowFiles(false);
            setFocusCommentInput(true);
          }}
          onCommentCountClick={() => {
            setShowComments(!showComments);
            if (!showComments) {
              setShowFiles(false);
            }
          }}
          onFileIconClick={() => setShowUploadModal(true)}
          onFilesClick={() => {
            setShowFiles(!showFiles);
            if (!showFiles) {
              setShowComments(false);
            }
          }}
          onEditClick={() => onEditPost?.(post)}
          onDeleteClick={handleDeletePost}
        />
      ) : (
        <div className="border-t border-gray-200 pt-3 mt-3 flex gap-4 justify-center">
          <div className="flex flex-col items-center">
            <span className="text-lg">❤️</span>
            <span className="text-sm text-gray-600">{likesStats.total}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg">💬</span>
            <span className="text-sm text-gray-600">{commentsCount}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg">📎</span>
            <span className="text-sm text-gray-600">{filesCount}</span>
          </div>
        </div>
        )}
      </div>

      {/* Files Grid */}
      {showFiles && filesCount > 0 && (
        <FilesGrid
          postId={post._id}
          onFileDeleted={() => {
            setFilesCount(prev => Math.max(0, prev - 1));
          }}
        />
      )}

      {/* Comments Section */}
      {showComments && (
        <CommentsSection
          postId={post._id}
          focusInput={focusCommentInput}
          onFocusHandled={() => setFocusCommentInput(false)}
          onCommentAdded={() => setCommentsCount(prev => prev + 1)}
        />
      )}

      {/* Likes Popup */}
      <LikesPopup
        isOpen={isLikesPopupOpen}
        targetId={post._id}
        targetType="post"
        onClose={() => setIsLikesPopupOpen(false)}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        postId={post._id}
        onClose={() => setShowUploadModal(false)}
        onFileUploaded={() => {
          setFilesCount(prev => prev + 1);
          setShowFiles(true);
        }}
      />
    </div>
  );
}
