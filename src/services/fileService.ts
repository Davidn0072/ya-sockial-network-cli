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
};

export default fileService;
