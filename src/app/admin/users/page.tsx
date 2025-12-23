import { prisma } from '@/lib/prisma';

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          favorites: true,
          playHistory: true,
        },
      },
    },
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Users</h1>

      <div className="overflow-hidden rounded-xl bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Favorites</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Plays</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                    user.role === 'ADMIN'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {user._count.favorites}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {user._count.playHistory}
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
  );
}
