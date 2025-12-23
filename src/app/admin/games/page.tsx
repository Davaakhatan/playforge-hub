import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DeleteGameButton } from '@/components/admin/DeleteGameButton';

async function getGames() {
  return prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminGamesPage() {
  const games = await getGames();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <Link
          href="/admin/games/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-cyan-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Add Game
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Featured</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{game.title}</p>
                    <p className="text-xs text-zinc-500">{game.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
                    {game.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                    game.hidden ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {game.hidden ? 'Hidden' : 'Visible'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {game.featured && (
                    <span className="inline-flex rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/games/${game.slug}`}
                      className="text-sm text-zinc-400 hover:text-white"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/games/${game.id}/edit`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <DeleteGameButton gameId={game.id} gameTitle={game.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
