'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface GameFormData {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  screenshots: string[];
  tags: string[];
  size: string;
  type: string;
  releaseStatus: string;
  url: string;
  platforms: string[];
  developer: string;
  releaseDate: string;
  version: string;
  featured: boolean;
  hidden: boolean;
}

interface GameFormProps {
  initialData?: Partial<GameFormData>;
  gameId?: string;
}

export function GameForm({ initialData, gameId }: GameFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<GameFormData>({
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    shortDescription: initialData?.shortDescription || '',
    longDescription: initialData?.longDescription || '',
    thumbnail: initialData?.thumbnail || '',
    screenshots: initialData?.screenshots || [],
    tags: initialData?.tags || [],
    size: initialData?.size || 'mini',
    type: initialData?.type || 'web-embed',
    releaseStatus: initialData?.releaseStatus || 'released',
    url: initialData?.url || '',
    platforms: initialData?.platforms || ['web'],
    developer: initialData?.developer || '',
    releaseDate: initialData?.releaseDate || '',
    version: initialData?.version || '',
    featured: initialData?.featured || false,
    hidden: initialData?.hidden || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = gameId ? `/api/games/${gameId}` : '/api/games';
      const method = gameId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save game');
      }

      router.push('/admin/games');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          label="Slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="url-friendly-name"
        />
      </div>

      <Input
        label="Short Description"
        value={formData.shortDescription}
        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
        required
        placeholder="Max 120 characters"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Long Description
        </label>
        <textarea
          value={formData.longDescription}
          onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
          rows={4}
          className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Thumbnail URL"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          required
        />
        <Input
          label="Game URL"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Size</label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="mini">Mini</option>
            <option value="medium">Medium</option>
            <option value="big">Big</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="web-embed">Web Embed</option>
            <option value="external">External</option>
            <option value="download">Download</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Status</label>
          <select
            value={formData.releaseStatus}
            onChange={(e) => setFormData({ ...formData, releaseStatus: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="prototype">Prototype</option>
            <option value="early-access">Early Access</option>
            <option value="released">Released</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Input
          label="Developer"
          value={formData.developer}
          onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
        />
        <Input
          label="Version"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        />
        <Input
          label="Release Date"
          type="date"
          value={formData.releaseDate}
          onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
        />
      </div>

      <Input
        label="Tags (comma separated)"
        value={formData.tags.join(', ')}
        onChange={(e) => setFormData({
          ...formData,
          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
        })}
        placeholder="action, arcade, puzzle"
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-300">Featured</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.hidden}
            onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-300">Hidden</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : gameId ? 'Update Game' : 'Create Game'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/games')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
