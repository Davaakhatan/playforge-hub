import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getStats() {
  const [
    totalGames,
    totalUsers,
    featuredGames,
    totalReviews,
    totalFavorites,
    totalCollections,
    webGames,
    downloadGames,
    externalGames,
    totalComments,
    pendingReports,
  ] = await Promise.all([
    prisma.game.count({ where: { hidden: false } }),
    prisma.user.count(),
    prisma.game.count({ where: { featured: true, hidden: false } }),
    prisma.review.count(),
    prisma.favorite.count(),
    prisma.collection.count({ where: { isPublic: true } }),
    prisma.game.count({ where: { type: 'web-embed', hidden: false } }),
    prisma.game.count({ where: { type: 'download', hidden: false } }),
    prisma.game.count({ where: { type: 'external', hidden: false } }),
    prisma.comment.count({ where: { isHidden: false } }),
    prisma.report.count({ where: { status: 'pending' } }),
  ]);

  const recentGames = await prisma.game.findMany({
    where: { hidden: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, slug: true, createdAt: true },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  const topRatedGames = await prisma.game.findMany({
    where: { hidden: false },
    take: 5,
    include: {
      reviews: { select: { rating: true } },
    },
  });

  const gamesWithRatings = topRatedGames
    .map((game) => ({
      ...game,
      avgRating:
        game.reviews.length > 0
          ? game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length
          : 0,
      reviewCount: game.reviews.length,
    }))
    .filter((g) => g.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating);

  return {
    totalGames,
    totalUsers,
    featuredGames,
    totalReviews,
    totalFavorites,
    totalCollections,
    webGames,
    downloadGames,
    externalGames,
    totalComments,
    pendingReports,
    recentGames,
    recentUsers,
    topRatedGames: gamesWithRatings,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Primary Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-400">
                <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 01.878.645 49.17 49.17 0 01.376 5.452.657.657 0 01-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 00-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 01-.595 4.845.75.75 0 01-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 01-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 01-.658.643 49.118 49.118 0 01-4.708-.36.75.75 0 01-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 005.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82.75.75 0 01.83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 00.657-.642z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Games</p>
              <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-green-400">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-400">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Reviews</p>
              <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-purple-400">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Favorites</p>
              <p className="text-2xl font-bold text-white">{stats.totalFavorites}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Featured</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.featuredGames}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Web Games</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.webGames}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Downloads</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.downloadGames}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Public Collections</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.totalCollections}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
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
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/moderation"
            className="relative inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Moderation
            {stats.pendingReports > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {stats.pendingReports > 9 ? '9+' : stats.pendingReports}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Recent Users */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Users</h2>
          <div className="overflow-hidden rounded-xl bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        user.role === 'ADMIN'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Rated Games */}
      {stats.topRatedGames.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Top Rated Games</h2>
          <div className="overflow-hidden rounded-xl bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Game</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {stats.topRatedGames.map((game) => (
                  <tr key={game.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-3 text-sm text-white">{game.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-yellow-400">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-white">{game.avgRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {game.reviewCount} reviews
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
