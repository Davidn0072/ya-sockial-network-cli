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
  onReactionsClick?: () => void;
}

export function CommentActions({
  commentId: _commentId,
  likesStats,
  onReactionsClick,
}: CommentActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
      {/* Reactions */}
      <button
        onClick={onReactionsClick}
        className="flex items-center gap-1 hover:text-blue-500 transition-colors py-1 px-2 hover:bg-gray-100 rounded"
      >
        <span className="text-sm">👍</span>
        <span>{totalReactions}</span>
      </button>
    </div>
  );
}
