import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getStats() {
  const [totalGames, totalUsers, featuredGames] = await Promise.all([
    prisma.game.count({ where: { hidden: false } }),
    prisma.user.count(),
    prisma.game.count({ where: { featured: true, hidden: false } }),
  ]);

  const recentGames = await prisma.game.findMany({
    where: { hidden: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, slug: true, createdAt: true },
  });

  return { totalGames, totalUsers, featuredGames, recentGames };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Total Games</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.totalGames}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Featured Games</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.featuredGames}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/admin/games/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-cyan-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Add Game
          </Link>
          <Link
            href="/admin/games"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Manage Games
          </Link>
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Games</h2>
        <div className="overflow-hidden rounded-xl bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Added</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentGames.map((game) => (
                <tr key={game.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-sm text-white">{game.title}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/games/${game.id}/edit`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
