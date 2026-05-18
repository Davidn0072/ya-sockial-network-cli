import { useState, useEffect } from 'react';
import fileService, { type FileItem } from '../services/fileService';

interface FilesGridProps {
  postId: string;
}

export function FilesGrid({ postId }: FilesGridProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async (cursor: string | null = null) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fileService.getFilesByPostId(postId, 4, cursor);

      if (cursor) {
        setFiles(prev => [...prev, ...response.files]);
      } else {
        setFiles(response.files);
      }
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [postId]);

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileUrl = (file: FileItem): string => {
    return `http://localhost:3000/uploads/${file.postId}/${file.storageFileName}`;
  };

  if (isLoading && files.length === 0) {
    return <div className="text-gray-500 text-sm">Loading files...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (files.length === 0) {
    return <div className="text-gray-500 text-sm">No files</div>;
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-4 gap-4">
        {files.map(file => {
          const fileUrl = getFileUrl(file);
          const isImage = isImageFile(file.originalFileName);

          return (
            <a
              key={file._id}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
            >
              {isImage ? (
                <>
                  <img
                    src={fileUrl}
                    alt={file.originalFileName}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="text-xs text-center text-gray-700 truncate w-full" title={file.originalFileName}>
                    {file.originalFileName}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl">📎</div>
                  <div className="text-xs text-center text-gray-700 truncate w-full" title={file.originalFileName}>
                    {file.originalFileName}
                  </div>
                </>
              )}
            </a>
          );
        })}
      </div>

      {nextCursor && (
        <button
          onClick={() => loadFiles(nextCursor)}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          Load More Files
        </button>
      )}
    </div>
  );
}
