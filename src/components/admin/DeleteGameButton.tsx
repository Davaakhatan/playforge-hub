'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteGameButtonProps {
  gameId: string;
  gameTitle: string;
}

export function DeleteGameButton({ gameId, gameTitle }: DeleteGameButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${gameTitle}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete game');
      }
    } catch {
      alert('Failed to delete game');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
