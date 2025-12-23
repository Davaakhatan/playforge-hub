'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  tags: string[];
  className?: string;
}

const sizeOptions = [
  { value: 'mini', label: 'Mini' },
  { value: 'medium', label: 'Medium' },
  { value: 'big', label: 'Big' },
];

const typeOptions = [
  { value: 'web-embed', label: 'Web' },
  { value: 'external', label: 'External' },
  { value: 'download', label: 'Download' },
];

const statusOptions = [
  { value: 'released', label: 'Released' },
  { value: 'early-access', label: 'Early Access' },
  { value: 'prototype', label: 'Prototype' },
];

export function FilterSidebar({ tags, className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSizes = searchParams.getAll('size');
  const selectedTypes = searchParams.getAll('type');
  const selectedStatuses = searchParams.getAll('status');
  const selectedTags = searchParams.getAll('tag');

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);

    if (current.includes(value)) {
      params.delete(key);
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/?${params.toString()}`);
  };

  const hasFilters = selectedSizes.length > 0 || selectedTypes.length > 0 ||
                     selectedStatuses.length > 0 || selectedTags.length > 0;

  return (
    <aside className={cn('space-y-6', className)}>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Clear all filters
        </button>
      )}

      {/* Size Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Size</h3>
        <div className="space-y-2">
          {sizeOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSizes.includes(option.value)}
                onChange={() => toggleFilter('size', option.value)}
                className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Type</h3>
        <div className="space-y-2">
          {typeOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(option.value)}
                onChange={() => toggleFilter('type', option.value)}
                className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Status</h3>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(option.value)}
                onChange={() => toggleFilter('status', option.value)}
                className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter('tag', tag)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
