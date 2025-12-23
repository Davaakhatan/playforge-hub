'use client';

import { useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';
import { CommentForm } from './CommentForm';

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

interface CommentItemProps {
  comment: Comment;
  gameSlug: string;
  currentUserId?: string;
  onDeleted: (commentId: string) => void;
  onUpdated: (comment: Comment) => void;
  onReplyAdded: (parentId: string, reply: Comment) => void;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  gameSlug,
  currentUserId,
  onDeleted,
  onUpdated,
  onReplyAdded,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(
    comment.likes?.some((l) => l.userId === currentUserId) || false
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUserId === comment.user.id;

  const handleLike = async () => {
    if (!currentUserId) return;

    const method = liked ? 'DELETE' : 'POST';
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method,
      });
      const data = await response.json();

      if (response.ok) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await response.json();

      if (response.ok) {
        onUpdated(data.comment);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleted(comment.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyAdded = (reply: Comment) => {
    onReplyAdded(comment.id, reply);
    setIsReplying(false);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={`rounded-lg bg-zinc-800 p-4 ${isReply ? 'ml-8 mt-2' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-700">
          {comment.user.avatar ? (
            <img
              src={comment.user.avatar}
              alt={comment.user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              {comment.user.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">
              {comment.user.username}
            </span>
            <span className="text-xs text-zinc-500">
              {formatDistanceToNow(new Date(comment.createdAt))}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-zinc-500">(edited)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full resize-none rounded border border-zinc-600 bg-zinc-700 p-2 text-white"
                rows={3}
                maxLength={2000}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="rounded bg-zinc-600 px-3 py-1 text-sm text-white hover:bg-zinc-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-zinc-300">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm ${
                liked ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              disabled={!currentUserId}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              {likeCount > 0 && likeCount}
            </button>

            {!isReply && currentUserId && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-zinc-500 hover:text-zinc-300"
              >
                Reply
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm text-zinc-500 hover:text-red-400"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                gameSlug={gameSlug}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replyCount > 3 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mb-2 text-sm text-blue-400 hover:text-blue-300"
            >
              {showReplies
                ? 'Hide replies'
                : `Show ${comment.replyCount} replies`}
            </button>
          )}

          {showReplies &&
            comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                gameSlug={gameSlug}
                currentUserId={currentUserId}
                onDeleted={onDeleted}
                onUpdated={onUpdated}
                onReplyAdded={onReplyAdded}
                isReply
              />
            ))}
        </div>
      )}
    </div>
  );
}
