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
  onReply?: () => void;
}

export function CommentActions({
  commentId,
  likesStats,
  onReactionSuccess,
  onViewReactions,
  onToggleReplies,
  repliesIsVisible,
  onReply,
}: CommentActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {/* Reaction Button */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-1.5 rounded-full font-bold text-purple-600 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-sm border border-purple-200">
        <ReactionButton
          targetId={commentId}
          targetType="comment"
          onReactionSuccess={onReactionSuccess}
          onViewReactions={onViewReactions}
        />
        {totalReactions > 0 && (
          <>
            <span className="text-xs font-bold text-purple-700">{totalReactions}</span>
            <span className="text-xs font-bold text-purple-600">Reactions</span>
          </>
        )}
      </div>

      {/* Reply Button */}
      <button
        onClick={onReply}
        className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1.5 rounded-full font-bold text-green-600 hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:shadow-sm border border-green-200 cursor-pointer"
      >
        <span className="text-lg">💬</span>
        <span className="text-xs font-bold text-green-600">Reply</span>
      </button>

      {/* Show Replies Link */}
      <button
        onClick={onToggleReplies}
        className="text-xs font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-sm border border-blue-200 flex items-center gap-1"
      >
        <span className="text-lg">{repliesIsVisible ? '👁️' : '👁️'}</span> {repliesIsVisible ? 'Hide Replies' : 'Show Replies'}
      </button>
    </div>
  );
}
