'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // ? - Show keyboard shortcuts help
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowHelp((prev) => !prev);
      return;
    }

    // Escape - Close help modal
    if (e.key === 'Escape' && showHelp) {
      setShowHelp(false);
      return;
    }

    // g + h - Go home
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
      router.push('/');
      return;
    }

    // g + l - Go to library
    if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
      router.push('/library');
      return;
    }

    // g + c - Go to collections
    if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
      router.push('/collections');
      return;
    }

    // / - Focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }
  }, [router, showHelp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowHelp(false)}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <ShortcutRow keys={['?']} description="Toggle this help" />
          <ShortcutRow keys={['/']} description="Focus search" />
          <ShortcutRow keys={['Esc']} description="Close modals / Clear focus" />

          <div className="my-3 border-t border-zinc-200 dark:border-zinc-700" />

          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Navigation</p>
          <ShortcutRow keys={['H']} description="Go to Home" />
          <ShortcutRow keys={['L']} description="Go to Library" />
          <ShortcutRow keys={['C']} description="Go to Collections" />
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Press <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">?</kbd> to toggle this help
        </p>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{description}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="rounded border border-zinc-300 bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
