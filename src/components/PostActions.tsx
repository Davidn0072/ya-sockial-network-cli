import { ReactionButton } from './ReactionButton';
import styles from './PostActions.module.css';

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
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div className="flex gap-3 text-sm">
        {/* Reactions */}
        <div className="flex-1 flex gap-2">
          <ReactionButton
            targetId={postId}
            targetType="post"
            onReactionSuccess={onReactionSuccess}
            onViewReactions={onViewReactions}
            action="both"
            className={`${styles.actionButton} ${styles.actionButtonPurple} flex-1`}
          />
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonPurple} flex-1`}
            title="View reactions"
            onClick={onViewReactions}
          >
            <span className="font-bold text-lg">{totalReactions}</span>
            <span className="text-xs">Reactions</span>
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 flex gap-2">
          <button
            onClick={onCommentIconClick}
            className={`${styles.actionButton} ${styles.actionButtonBlue} flex-1`}
            title="Write a comment"
          >
            <span className="text-2xl">💬</span>
          </button>
          <button
            onClick={onCommentCountClick}
            className={`${styles.actionButton} ${styles.actionButtonBlue} flex-1`}
            title="View comments"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">{commentsCount}</span>
              <span className="text-xs">Comments</span>
            </div>
          </button>
        </div>

        {/* Files */}
        <div className="flex-1 flex gap-2">
          <button
            onClick={onFileIconClick}
            className={`${styles.actionButton} ${styles.actionButtonGreen} flex-1`}
            title="Upload file"
          >
            <span className="text-2xl">📎</span>
          </button>
          <button
            onClick={onFilesClick}
            className={`${styles.actionButton} ${styles.actionButtonGreen} flex-1`}
            title="View files"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">{filesCount}</span>
              <span className="text-xs">Files</span>
            </div>
          </button>
        </div>

        {/* Edit */}
        <button
          onClick={onEditClick}
          className={`${styles.actionButton} ${styles.actionButtonAmber} flex-1`}
          title="Edit post"
        >
          <span className="text-2xl">✏️</span>
          <div className="flex flex-col items-center">
            <span className="text-xs">Edit</span>
          </div>
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteClick}
          className={`${styles.actionButton} ${styles.actionButtonRed} flex-1`}
          title="Delete post"
        >
          <span className="text-2xl">🗑️</span>
          <div className="flex flex-col items-center">
            <span className="text-xs">Delete</span>
          </div>
        </button>
      </div>
    </div>
  );
}
