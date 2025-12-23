'use client';

import { StarRating } from './StarRating';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-zinc-400 text-center py-8">
        No reviews yet. Be the first to review!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                {review.user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-zinc-100">{review.user.username}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>

          {review.title && (
            <h4 className="mt-3 font-medium text-zinc-100">{review.title}</h4>
          )}

          {review.content && (
            <p className="mt-2 text-sm text-zinc-400">{review.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
