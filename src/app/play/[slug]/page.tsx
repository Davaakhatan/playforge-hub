import { notFound, redirect } from 'next/navigation';
import { getGameBySlug, getAllGames } from '@/features/catalog';
import { GamePlayer } from './GamePlayer';

interface PlayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const games = await getAllGames();
  // Only generate static params for web-embed games
  return games
    .filter((game) => game.type === 'web-embed')
    .map((game) => ({
      slug: game.slug,
    }));
}

export async function generateMetadata({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return { title: 'Game Not Found - Playforge' };
  }

  return {
    title: `Playing ${game.title} - Playforge`,
    description: game.shortDescription,
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Redirect non-embeddable games to their appropriate destinations
  if (game.type === 'external') {
    redirect(game.url);
  }

  if (game.type === 'download') {
    redirect(`/games/${game.slug}`);
  }

  return <GamePlayer game={game} />;
}
