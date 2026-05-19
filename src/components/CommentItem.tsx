import { useState, useEffect } from 'react';
import type { Comment } from '../services/commentService';
import { CommentActions } from './CommentActions';
import LikesPopup from './LikesPopup';
import { NestedRepliesList } from './NestedRepliesList';
import { ReplyInput } from './ReplyInput';
import { useNestedComments } from '../hooks/useNestedComments';
import { fetchLikesStats } from '../services/likesService';

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const nestedComments = useNestedComments(comment.postId, comment._id);
  const [likesStats, setLikesStats] = useState(comment.likesCount ? { total: comment.likesCount } : { total: 0 });
  const [isLikesPopupOpen, setIsLikesPopupOpen] = useState(false);
  const [isReplyInputOpen, setIsReplyInputOpen] = useState(false);

  useEffect(() => {
    loadLikesStats();
  }, [comment._id]);

  const loadLikesStats = async () => {
    try {
      const stats = await fetchLikesStats(comment._id, 'comment');
      if (stats) {
        setLikesStats(stats);
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

  const userIdString = comment.userId?._id || '';

  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % colors.length;
  };

  const colorIndex = userIdString ? getColorIndex(userIdString) : 0;
  const userName = comment.userId?.name || 'Unknown User';

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0">
      {/* Avatar */}
      <div className={`w-8 h-8 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
        {getInitial(userName)}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{userName}</span>
          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 break-words">{comment.content}</p>

        {/* Comment Actions */}
        <CommentActions
          commentId={comment._id}
          likesStats={likesStats}
          onReactionSuccess={loadLikesStats}
          onViewReactions={() => setIsLikesPopupOpen(true)}
          onToggleReplies={nestedComments.toggleReplies}
          repliesIsVisible={nestedComments.isVisible}
          onReply={() => setIsReplyInputOpen(!isReplyInputOpen)}
        />

        {/* Reply Input */}
        {isReplyInputOpen && (
          <ReplyInput
            postId={comment.postId}
            parentCommentId={comment._id}
            onReplySuccess={(newReply) => {
              setIsReplyInputOpen(false);
              nestedComments.addReplyToList(newReply);
              if (!nestedComments.isVisible) {
                nestedComments.toggleReplies();
              }
            }}
            onCancel={() => setIsReplyInputOpen(false)}
          />
        )}

        {/* Nested Replies */}
        {nestedComments.isVisible && (
          <NestedRepliesList
            replies={nestedComments.replies}
            isLoading={nestedComments.isLoading}
            error={nestedComments.error}
            hasMore={nestedComments.hasMore}
            onLoadMore={nestedComments.loadMore}
          />
        )}
      </div>

      {/* Likes Popup */}
      <LikesPopup
        isOpen={isLikesPopupOpen}
        targetId={comment._id}
        targetType="comment"
        onClose={() => setIsLikesPopupOpen(false)}
      />
    </div>
  );
}
