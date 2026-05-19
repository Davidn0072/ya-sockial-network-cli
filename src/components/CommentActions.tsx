import { ReactionButton } from './ReactionButton';

interface CommentActionsProps {
  commentId: string;
  likesStats?: {
    total: number;
    like?: number;
    love?: number;
    celebrate?: number;
    insightful?: number;
    funny?: number;
  };
  onReactionSuccess?: () => void;
  onViewReactions?: () => void;
  onToggleReplies?: () => void;
  repliesIsVisible?: boolean;
}

export function CommentActions({
  commentId,
  likesStats,
  onReactionSuccess,
  onViewReactions,
  onToggleReplies,
  repliesIsVisible,
}: CommentActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="flex items-center gap-3 mt-2">
      {/* Reaction Button */}
      <ReactionButton
        targetId={commentId}
        targetType="comment"
        onReactionSuccess={onReactionSuccess}
        onViewReactions={onViewReactions}
      />

      {/* Likes Count */}
      {totalReactions > 0 && (
        <span className="text-xs text-gray-500">{totalReactions} reactions</span>
      )}

      {/* Reply Button */}
      <button
        className="text-xs text-gray-500 hover:text-gray-700 hover:font-semibold transition-colors"
      >
        Reply
      </button>

      {/* Show Replies Link */}
      <button
        onClick={onToggleReplies}
        className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
      >
        {repliesIsVisible ? 'Hide Replies' : 'Show Replies'}
      </button>
    </div>
  );
}
