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
  onCommentIconClick?: () => void;
  onCommentCountClick?: () => void;
  onFileIconClick?: () => void;
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
  onCommentIconClick,
  onCommentCountClick,
  onFileIconClick,
  onFilesClick,
  onEditClick,
  onDeleteClick,
}: PostActionsProps) {
  const totalReactions = likesStats?.total || 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex gap-4 text-sm text-gray-600">
        {/* Reactions */}
        <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-50 rounded transition-all hover:bg-purple-100 hover:scale-105 font-bold text-purple-600">
          <ReactionButton
            targetId={postId}
            targetType="post"
            onReactionSuccess={onReactionSuccess}
            onViewReactions={onViewReactions}
          />
          <span className="font-bold text-purple-700 text-lg">{totalReactions}</span>
          <span className="text-xs font-bold text-purple-600">Reactions</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1 text-blue-600 transition-all flex-1 justify-center py-2 bg-blue-50 rounded font-bold">
          <button
            onClick={onCommentIconClick}
            className="flex items-center gap-1 text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 rounded px-2 py-1"
            title="Write a comment"
          >
            <span className="text-2xl">💬</span>
          </button>
          <button
            onClick={onCommentCountClick}
            className="flex items-center gap-1 text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 rounded px-2 py-1"
            title="View comments"
          >
            <span className="font-bold text-blue-700">{commentsCount}</span>
            <span className="text-xs font-bold text-blue-600">Comments</span>
          </button>
        </div>

        {/* Files */}
        <div className="flex items-center gap-2 text-green-600 flex-1 justify-center py-2 bg-green-50 rounded font-bold">
          <button
            onClick={onFileIconClick}
            className="flex items-center text-green-600 transition-all hover:scale-125 rounded p-1"
            title="Upload file"
          >
            <span className="text-2xl">📎</span>
          </button>
          <button
            onClick={onFilesClick}
            className="flex items-center gap-2 text-green-600 transition-all hover:bg-green-100 hover:scale-105 rounded px-2 py-1"
          >
            <span className="font-bold text-green-700">{filesCount}</span>
            <span className="text-xs font-bold text-green-600">Files</span>
          </button>
        </div>

        {/* Edit */}
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 text-amber-600 transition-all flex-1 justify-center py-2 bg-amber-50 rounded font-bold hover:bg-amber-100 hover:scale-105"
        >
          <span className="text-2xl">✏️</span>
          <span className="text-xs font-bold text-amber-600">Edit</span>
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteClick}
          className="flex items-center gap-2 text-red-600 transition-all flex-1 justify-center py-2 bg-red-50 rounded font-bold hover:bg-red-100 hover:scale-105"
        >
          <span className="text-2xl">🗑️</span>
          <span className="text-xs font-bold text-red-600">Delete</span>
        </button>
      </div>
    </div>
  );
}
