import { useState } from 'react';
import commentService from '../services/commentService';

import type { Comment } from '../services/commentService';

interface ReplyInputProps {
  postId: string;
  parentCommentId: string;
  onReplySuccess: (newReply: Comment) => void;
  onCancel: () => void;
}

export function ReplyInput({
  postId,
  parentCommentId,
  onReplySuccess,
  onCancel,
}: ReplyInputProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newReply = await commentService.addReply(postId, parentCommentId, content.trim());
      setContent('');
      onReplySuccess(newReply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-8 mt-3 p-3 bg-gray-50 rounded border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
          disabled={isLoading}
        />

        {error && <div className="text-xs text-red-500">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
