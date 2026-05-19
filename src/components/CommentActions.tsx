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
      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded font-bold text-purple-600 hover:bg-purple-100 transition-all hover:scale-105">
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
      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded font-bold text-green-600 hover:bg-green-100 transition-all hover:scale-105 cursor-pointer" onClick={onReply}>
        <span className="text-lg">💬</span>
        <span className="text-xs font-bold text-green-600">Reply</span>
      </div>

      {/* Show Replies Link */}
      <button
        onClick={onToggleReplies}
        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-all hover:scale-105 flex items-center gap-1"
      >
        <span className="text-lg">{repliesIsVisible ? '👁️' : '👁️'}</span> {repliesIsVisible ? 'Hide Replies' : 'Show Replies'}
      </button>
    </div>
  );
}
