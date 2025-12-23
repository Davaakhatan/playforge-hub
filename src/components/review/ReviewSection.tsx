'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';

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

interface ReviewSectionProps {
  gameId: string;
}

export function ReviewSection({ gameId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ count: 0, averageRating: 0 });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?gameId=${gameId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { count: 0, averageRating: 0 });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const userReview = reviews.find((r) => r.user.id === user?.id);

  const handleSubmit = () => {
    setShowForm(false);
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Reviews</h3>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={stats.averageRating} size="sm" />
            <span className="text-sm text-zinc-400">
              {stats.averageRating.toFixed(1)} ({stats.count}{' '}
              {stats.count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {user && !showForm && (
          <Button
            variant={userReview ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setShowForm(true)}
          >
            {userReview ? 'Edit Review' : 'Write Review'}
          </Button>
        )}
      </div>

      {/* Login prompt for unauthenticated users */}
      {!user && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-zinc-400">
            <a href="/login" className="text-blue-400 hover:underline">
              Sign in
            </a>{' '}
            to leave a review
          </p>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <ReviewForm
            gameId={gameId}
            existingReview={userReview}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
        </div>
      ) : (
        <ReviewList reviews={reviews} />
      )}
    </div>
  );
}
