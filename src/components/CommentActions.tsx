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
}

export function CommentActions({
  commentId,
  likesStats,
  onReactionSuccess,
  onViewReactions,
}: CommentActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="flex items-center gap-2 mt-2">
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
    </div>
  );
}
