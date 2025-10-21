import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BotBattleGameClient } from './BotBattleGameClient';

export default async function BotBattlePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-orbitron mb-4">
            Bot Battle Arena
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Click the target bot before it disappears! Fast clicks and streaks earn bonus points.
          </p>
        </div>

        {/* Game Component */}
        <BotBattleGameClient userId={userId} />
      </div>
    </div>
  );
}

