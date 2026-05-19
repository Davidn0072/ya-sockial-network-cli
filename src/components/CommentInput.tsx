import { useState } from 'react';
import commentService from '../services/commentService';
import type { Comment } from '../services/commentService';

interface CommentInputProps {
  postId: string;
  onCommentSuccess: (newComment: Comment) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export function CommentInput({ postId, onCommentSuccess, inputRef }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newComment = await commentService.addComment(postId, content.trim());
      setContent('');
      onCommentSuccess(newComment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={inputRef}
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
          disabled={isLoading}
        />

        {error && <div className="text-xs text-red-500">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
          >
            {isLoading ? 'Posting...' : 'Add Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
