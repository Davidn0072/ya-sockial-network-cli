import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import type { Post } from '../services/postService';
import type { Comment } from '../services/commentService';
import type { FileItem } from '../services/fileService';
import { TopNavbar } from '../components/TopNavbar';
import { PostCard } from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

const DETAIL_FILES_LIMIT = 4;
const DETAIL_COMMENTS_LIMIT = 5;

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [prefetchedComments, setPrefetchedComments] = useState<{ comments: Comment[]; nextCursor: string | null } | undefined>();
  const [prefetchedFiles, setPrefetchedFiles] = useState<{ files: FileItem[]; nextCursor: string | null } | undefined>();
  const [loading, setLoading] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<{ _id: string; content: string } | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await postService.getPostWithDetails(
        postId!,
        DETAIL_FILES_LIMIT,
        DETAIL_COMMENTS_LIMIT
      );
      setPost(data.post);
      setPrefetchedComments({
        comments: data.comments?.comments ?? [],
        nextCursor: data.comments?.nextCursor ?? null,
      });
      setPrefetchedFiles({
        files: data.files?.files ?? [],
        nextCursor: data.files?.nextCursor ?? null,
      });
    } catch (err) {
      console.error('Error loading post:', err);
      setPost(null);
      setPrefetchedComments(undefined);
      setPrefetchedFiles(undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = async (post: Post) => {
    try {
      const fullPost = await postService.getPostById(post._id);
      setEditingPost({ _id: fullPost._id, content: fullPost.content });
      setIsCreatePostOpen(true);
    } catch (error) {
      console.error('Error loading post for editing:', error);
    }
  };

  const handlePostUpdated = () => {
    loadPost();
    setIsCreatePostOpen(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;

    postService.deletePost(postId)
      .then(() => navigate(-1))
      .catch((error) => {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar activeTab="feed" onTabChange={() => {}} />

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Back
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Loading post...</div>
          </div>
        ) : post ? (
          <>
            <PostCard
              post={post}
              detailMode
              prefetchedComments={prefetchedComments}
              prefetchedFiles={prefetchedFiles}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-center">
            <p className="text-gray-600">Failed to load post</p>
          </div>
        )}

        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => {
            setIsCreatePostOpen(false);
            setEditingPost(null);
          }}
          onPostCreated={handlePostUpdated}
          editingPost={editingPost}
        />
      </div>
    </div>
  );
}
