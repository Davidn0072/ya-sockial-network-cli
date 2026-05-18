import { useState, useEffect } from 'react';
import postService from '../services/postService';
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  editingPost?: {
    _id: string;
    content: string;
  } | null;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, editingPost }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (isOpen && editingPost) {
      setContent(editingPost.content);
    } else if (isOpen) {
      setContent('');
    }
  }, [isOpen, editingPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setStatus('Content is required');
      setStatusType('error');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      if (editingPost) {
        console.log('Updating post:', editingPost._id);
        // TODO: Call updatePost service
      } else {
        await postService.createPost(trimmedContent);
      }

      setStatus(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      setStatusType('success');

      setTimeout(() => {
        setContent('');
        setStatus('');
        setStatusType('');
        onPostCreated?.();
        onClose();
      }, 500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save post';
      setStatus(`Error: ${errorMsg}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{editingPost ? 'Edit Post' : 'Add Post'}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <label htmlFor="content" className={styles.label}>
              Content:
            </label>
            <textarea
              id="content"
              className={styles.textarea}
              placeholder="What's on your mind..."
              minLength={1}
              maxLength={1000}
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {status && (
              <div className={`${styles.status} ${styles[statusType]}`}>
                {status}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (editingPost ? 'Saving...' : 'Posting...') : (editingPost ? 'Save' : 'Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
