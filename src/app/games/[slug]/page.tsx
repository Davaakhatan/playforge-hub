import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { SizeBadge, TypeBadge, StatusBadge, TagBadge } from '@/components/ui/Badge';
import { FavoriteButton, ScreenshotGallery } from '@/components/game';
import { ReviewSection } from '@/components/review';
import type { GameEntry } from '@/types';

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

function transformGame(game: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  screenshots: string;
  tags: string;
  size: string;
  type: string;
  releaseStatus: string;
  url: string;
  platforms: string;
  developer: string | null;
  releaseDate: Date | null;
  version: string | null;
  featured: boolean;
  hidden: boolean;
}): GameEntry {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    shortDescription: game.shortDescription,
    longDescription: game.longDescription,
    thumbnail: game.thumbnail,
    screenshots: JSON.parse(game.screenshots),
    tags: JSON.parse(game.tags),
    size: game.size as GameEntry['size'],
    type: game.type as GameEntry['type'],
    releaseStatus: game.releaseStatus as GameEntry['releaseStatus'],
    url: game.url,
    platforms: JSON.parse(game.platforms),
    developer: game.developer ?? undefined,
    releaseDate: game.releaseDate?.toISOString().split('T')[0],
    version: game.version ?? undefined,
    featured: game.featured,
    hidden: game.hidden,
  };
}

async function getGameBySlug(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug, hidden: false },
  });
  return game ? transformGame(game) : null;
}

export async function generateMetadata({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return { title: 'Game Not Found - Playforge' };
  }

  return {
    title: `${game.title} - Playforge`,
    description: game.shortDescription,
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Determine the primary action based on game type
  const getActionButton = () => {
    switch (game.type) {
      case 'web-embed':
        return (
          <Link href={`/play/${game.slug}`}>
            <Button size="lg" className="w-full sm:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
              Play Now
            </Button>
          </Link>
        );
      case 'external':
        return (
          <a href={game.url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81l-8.97 8.97a.75.75 0 11-1.06-1.06l8.97-8.97h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z"
                  clipRule="evenodd"
                />
              </svg>
              Open External
            </Button>
          </a>
        );
      case 'download':
        return (
          <a href={game.url} download>
            <Button size="lg" className="w-full sm:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </Button>
          </a>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="mr-1 h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
            clipRule="evenodd"
          />
        </svg>
        Back to Store
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Screenshots */}
          {game.screenshots && game.screenshots.length > 0 && (
            <ScreenshotGallery screenshots={game.screenshots} title={game.title} />
          )}

          {/* Description */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">About This Game</h3>
            <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{game.longDescription}</p>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <ReviewSection gameId={game.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6 rounded-xl bg-zinc-100 p-6 dark:bg-zinc-900">
            {/* Title & Developer */}
            <div>
              <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">{game.title}</h1>
              {game.developer && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">by {game.developer}</p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <SizeBadge size={game.size} />
              <TypeBadge type={game.type} />
              <StatusBadge status={game.releaseStatus} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {getActionButton()}
              <FavoriteButton gameId={game.id} size="lg" />
            </div>

            {/* Tags */}
            {game.tags.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
              {game.releaseDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Release Date</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {game.version && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Version</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{game.version}</span>
                </div>
              )}
              {game.platforms && game.platforms.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Platforms</span>
                  <span className="text-zinc-700 capitalize dark:text-zinc-300">
                    {game.platforms.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
