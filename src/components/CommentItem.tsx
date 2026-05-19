import { useState, useEffect } from 'react';
import type { Comment } from '../services/commentService';
import { CommentActions } from './CommentActions';
import LikesPopup from './LikesPopup';
import { NestedRepliesList } from './NestedRepliesList';
import { ReplyInput } from './ReplyInput';
import { useNestedComments } from '../hooks/useNestedComments';
import { useAuth } from '../hooks/useAuth';
import { fetchLikesStats } from '../services/likesService';

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  console.log('CommentItem rendering with comment:', comment);
  const { user: currentUser } = useAuth();
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

  let userIdString = comment.userId?._id || '';
  if (userIdString === "") {
    userIdString = currentUser?.id || '';
  }

  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % colors.length;
  };
  //authService.getUser().id
  console.log('AuthContextType (useAuth):', { currentUser });


  const colorIndex = userIdString ? getColorIndex(userIdString) : 0;

  // אם אין username בcomment, בדוק אם זה ה-current user
  let userName = comment.userId?.name;
  if (!userName && currentUser) {
    const currentUserId = typeof currentUser === 'object' ? currentUser.id : null;
    const currentUserName = typeof currentUser === 'object' ? currentUser.name : currentUser;

    if (currentUserId && userIdString === currentUserId) {
      userName = currentUserName;
    }
  }
  userName = userName || 'Unknown User';

  return (
    <div className="flex gap-3 py-3 px-3 bg-white rounded-lg mb-2 border border-blue-100 hover:border-blue-300 transition-colors duration-200 hover:shadow-sm">
      {/* Avatar */}
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
        {getInitial(userName)}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-gray-800">{userName}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 break-words leading-relaxed">{comment.content}</p>

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
