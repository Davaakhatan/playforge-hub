'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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

interface CommentFormProps {
  gameSlug: string;
  parentId?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  gameSlug,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = 'Write a comment...',
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${gameSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      onCommentAdded(data.comment);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={3}
        maxLength={2000}
      />

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {content.length}/2000
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
