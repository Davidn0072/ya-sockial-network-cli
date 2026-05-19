import { useState, useRef } from 'react';
import fileService from '../services/fileService';
import styles from './FileUploadModal.module.css';

interface FileUploadModalProps {
  isOpen: boolean;
  postId: string;
  onClose: () => void;
  onFileUploaded?: () => void;
}

export default function FileUploadModal({ isOpen, postId, onClose, onFileUploaded }: FileUploadModalProps) {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setStatus('Please select a file');
      setStatusType('error');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading...');
    setStatusType('');

    try {
      await fileService.uploadFile(postId, file);

      setStatus('File uploaded successfully!');
      setStatusType('success');

      setTimeout(() => {
        setStatus('');
        setStatusType('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onFileUploaded?.();
        onClose();
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload file';
      setStatus(errorMsg);
      setStatusType('error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Upload File to Post</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.fileInput}
            disabled={isUploading}
          />
          {status && (
            <div className={`${styles.status} ${statusType === 'success' ? styles.success : styles.error}`}>
              {status}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
