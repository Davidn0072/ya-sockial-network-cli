import { useState } from 'react';
import fileService, { type FileItem as FileItemType } from '../services/fileService';
import { useAuth } from '../hooks/useAuth';
import styles from './FileItem.module.css';

interface FileItemProps {
  file: FileItemType;
  onFileDeleted?: (fileId: string) => void;
  onFileRenamed?: (updatedFile: FileItemType) => void;
}

export function FileItem({ file, onFileDeleted, onFileRenamed }: FileItemProps) {
  const { user: currentUser } = useAuth();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState(file.originalFileName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileUrl = `http://localhost:3000/uploads/${file.postId}/${file.storageFileName}`;

  const isImageFile = (): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => file.originalFileName.toLowerCase().endsWith(ext));
  };

  const isFileOwner = currentUser && typeof currentUser === 'object' && currentUser.id === file.userId;

  const handleRenameClick = () => {
    setIsRenaming(true);
    setRenameError(null);
  };

  const handleSaveRename = async () => {
    if (!newFileName.trim()) {
      setRenameError('File name cannot be empty');
      return;
    }

    if (newFileName === file.originalFileName) {
      setIsRenaming(false);
      return;
    }

    setIsUpdating(true);
    setRenameError(null);

    try {
      const updatedFile = await fileService.renameFile(file._id, newFileName.trim());
      setIsRenaming(false);
      onFileRenamed?.(updatedFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename file';
      setRenameError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewFileName(file.originalFileName);
    setRenameError(null);
  };

  const handleDelete = async () => {
    try {
      await fileService.deleteFile(file._id);
      onFileDeleted?.(file._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      console.error('Failed to delete file:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors relative group">
      {/* File Preview */}
      {isImageFile() ? (
        <>
          <img
            src={fileUrl}
            alt={file.originalFileName}
            className="w-20 h-20 object-cover rounded"
          />
        </>
      ) : (
        <>
          <div className="text-3xl">📎</div>
        </>
      )}

      {/* Filename or Rename Input */}
      {isRenaming ? (
        <div className="w-full flex flex-col gap-1">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={isUpdating}
            autoFocus
          />
          {renameError && <div className="text-xs text-red-500">{renameError}</div>}
          <div className="flex gap-1 justify-center">
            <button
              onClick={handleSaveRename}
              disabled={isUpdating}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-semibold"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelRename}
              disabled={isUpdating}
              className="px-2 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs text-center text-gray-700 truncate w-full" title={file.originalFileName}>
            {file.originalFileName}
          </div>

          {/* Owner Actions - Hidden by default, shown on hover */}
          {isFileOwner && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {/* Rename Button */}
              <button
                onClick={handleRenameClick}
                className={`${styles.actionButton} ${styles.actionButtonAmber}`}
                title="Rename file"
              >
                <span className="text-sm">✏️</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`${styles.actionButton} ${styles.actionButtonRed}`}
                title="Delete file"
              >
                <span className="text-sm">🗑️</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">Delete File?</h3>
            <p className="text-gray-600 text-sm mb-6">{file.originalFileName}</p>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
