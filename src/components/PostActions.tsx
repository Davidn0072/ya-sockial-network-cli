import { ReactionButton } from './ReactionButton';

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
  onReactionSuccess?: () => void;
  onViewReactions?: () => void;
  onCommentsClick?: () => void;
  onFilesClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export function PostActions({
  postId,
  likesStats,
  commentsCount = 0,
  filesCount = 0,
  onReactionSuccess,
  onViewReactions,
  onCommentsClick,
  onFilesClick,
  onEditClick,
  onDeleteClick,
}: PostActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex gap-4 text-sm text-gray-600">
        {/* Reactions */}
        <div className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors">
          <ReactionButton
            targetId={postId}
            targetType="post"
            onReactionSuccess={onReactionSuccess}
            onViewReactions={onViewReactions}
          />
          <span>{totalReactions}</span>
          <span className="text-xs">Reactions</span>
        </div>

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

        {/* Edit */}
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 hover:text-yellow-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">✏️</span>
          <span className="text-xs">Edit</span>
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteClick}
          className="flex items-center gap-2 hover:text-red-600 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">🗑️</span>
          <span className="text-xs">Delete</span>
        </button>
      </div>
    </div>
  );
}
