import { useState, useEffect } from 'react';
import fileService, { type FileItem } from '../services/fileService';
import { FileItem as FileItemComponent } from './FileItem';

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

  const handleFileDeleted = (fileId: string) => {
    setFiles(files.filter(f => f._id !== fileId));
  };

  const handleFileRenamed = (updatedFile: FileItem) => {
    setFiles(files.map(f => f._id === updatedFile._id ? updatedFile : f));
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
        {files.map(file => (
          <FileItemComponent
            key={file._id}
            file={file}
            onFileDeleted={handleFileDeleted}
            onFileRenamed={handleFileRenamed}
          />
        ))}
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
