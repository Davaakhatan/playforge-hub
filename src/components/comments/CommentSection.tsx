'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  likes: { userId: string }[];
  replies?: Comment[];
}

interface CommentSectionProps {
  gameSlug: string;
}

export function CommentSection({ gameSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await fetch(`/api/games/${gameSlug}/comments?page=${pageNum}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }

      if (append) {
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }

      setHasMore(pageNum < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [gameSlug]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  const handleReplyAdded = (parentId: string, reply: Comment) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replyCount: c.replyCount + 1,
            replies: [...(c.replies || []), reply],
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-white">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {user ? (
        <CommentForm gameSlug={gameSlug} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="mb-6 rounded-lg bg-zinc-800 p-4 text-center text-sm text-zinc-400">
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </a>{' '}
          to leave a comment
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-700" />
                  <div className="h-4 w-2/3 rounded bg-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg bg-zinc-800 p-8 text-center text-zinc-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              gameSlug={gameSlug}
              currentUserId={user?.id}
              onDeleted={handleCommentDeleted}
              onUpdated={handleCommentUpdated}
              onReplyAdded={handleReplyAdded}
            />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full rounded-lg bg-zinc-800 py-3 text-sm text-zinc-400 transition-colors hover:bg-zinc-700"
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
