import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

export type FileItem = {
  _id: string;
  postId: string;
  userId: string;
  originalFileName: string;
  storageFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
};

export type FilesResponse = {
  files: FileItem[];
  nextCursor: string | null;
};

const fileService = {
  async getFilesByPostId(postId: string, limit: number = 4, cursor: string | null = null): Promise<FilesResponse> {
    const token = authService.getToken();

    let url = `${API_URL}/files/db?postId=${encodeURIComponent(postId)}&limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch files (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
      files: data.files || [],
      nextCursor: data.nextCursor || null,
    };
  },

  async deleteFile(fileId: string): Promise<void> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/files/db/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  },

  async renameFile(fileId: string, newFileName: string): Promise<FileItem> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/files/db/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ originalFileName: newFileName }),
    });

    if (!response.ok) {
      throw new Error('Failed to rename file');
    }

    return response.json();
  },

  async uploadFile(postId: string, file: File): Promise<FileItem> {
    const token = authService.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/files/${postId}`, {
      method: 'POST',
      headers: {
        'x-access-token': token || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed (${response.status})`);
    }

    const data = await response.json();
    return data.result || data;
  },
};

export default fileService;
