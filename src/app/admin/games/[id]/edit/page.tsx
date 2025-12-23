import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { GameForm } from '@/components/admin/GameForm';

interface EditGamePageProps {
  params: Promise<{ id: string }>;
}

async function getGame(id: string) {
  const game = await prisma.game.findUnique({
    where: { id },
  });

  if (!game) return null;

  return {
    slug: game.slug,
    title: game.title,
    shortDescription: game.shortDescription,
    longDescription: game.longDescription,
    thumbnail: game.thumbnail,
    screenshots: JSON.parse(game.screenshots) as string[],
    tags: JSON.parse(game.tags) as string[],
    size: game.size,
    type: game.type,
    releaseStatus: game.releaseStatus,
    url: game.url,
    platforms: JSON.parse(game.platforms) as string[],
    developer: game.developer || '',
    releaseDate: game.releaseDate?.toISOString().split('T')[0] || '',
    version: game.version || '',
    featured: game.featured,
    hidden: game.hidden,
  };
}

export default async function EditGamePage({ params }: EditGamePageProps) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Game</h1>
      <div className="max-w-3xl rounded-xl bg-zinc-900 p-6">
        <GameForm initialData={game} gameId={id} />
      </div>
    </div>
  );
}
