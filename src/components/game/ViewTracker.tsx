'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  gameId: string;
}

export function ViewTracker({ gameId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Track view after a short delay (to filter out quick bounces)
    const timer = setTimeout(() => {
      fetch(`/api/games/${gameId}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' }),
      }).catch(console.error);
    }, 2000);

    return () => clearTimeout(timer);
  }, [gameId]);

  return null;
}
