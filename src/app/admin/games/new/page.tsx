import { GameForm } from '@/components/admin/GameForm';

export default function NewGamePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Add New Game</h1>
      <div className="max-w-3xl rounded-xl bg-zinc-900 p-6">
        <GameForm />
      </div>
    </div>
  );
}
