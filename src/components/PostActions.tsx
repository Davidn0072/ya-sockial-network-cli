
interface PostActionsProps {
  postId: string;
  likesStats?: {
    total: number;
    like: number;
    love: number;
    celebrate: number;
    insightful: number;
  };
  commentsCount?: number;
  filesCount?: number;
  onReactionsClick?: () => void;
  onCommentsClick?: () => void;
  onFilesClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export function PostActions({
  likesStats,
  commentsCount = 0,
  filesCount = 0,
  onReactionsClick,
  onCommentsClick,
  onFilesClick,
}: PostActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex gap-4 text-sm text-gray-600">
        {/* Reactions */}
        <button
          onClick={onReactionsClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">👍</span>
          <span>{totalReactions}</span>
          <span className="text-xs">Reactions</span>
        </button>

        {/* Comments */}
        <button
          onClick={onCommentsClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">💬</span>
          <span>{commentsCount}</span>
          <span className="text-xs">Comments</span>
        </button>

        {/* Files */}
        <button
          onClick={onFilesClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">📎</span>
          <span>{filesCount}</span>
          <span className="text-xs">Files</span>
        </button>
      </div>
    </div>
  );
}
