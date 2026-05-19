import { CommentItem } from './CommentItem';
import type { Comment } from '../services/commentService';

interface NestedRepliesListProps {
  replies: Comment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function NestedRepliesList({
  replies,
  isLoading,
  error,
  hasMore,
  onLoadMore,
}: NestedRepliesListProps) {
  if (error) {
    return (
      <div className="ml-8 mt-2 text-xs text-red-500">
        Failed to load replies
      </div>
    );
  }

  if (replies.length === 0 && !isLoading) {
    return (
      <div className="ml-8 mt-2 text-xs text-gray-400">
        No replies yet
      </div>
    );
  }

  return (
    <div className="ml-8 mt-2 border-l-2 border-gray-200 pl-0">
      {replies.map((reply) => (
        <CommentItem key={reply._id} comment={reply} />
      ))}

      {isLoading && (
        <div className="text-xs text-gray-400 py-2">
          Loading replies...
        </div>
      )}

      {hasMore && !isLoading && (
        <button
          onClick={onLoadMore}
          className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-2 transition-colors"
        >
          Load More Replies
        </button>
      )}
    </div>
  );
}
