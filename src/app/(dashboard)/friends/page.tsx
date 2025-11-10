import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FriendsManager } from '@/components/friends/FriendsManager';

export default async function FriendsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Friends
          </h1>
          <p className="text-gray-300 text-lg">
            Connect with other bot recruiters and compare your progress!
          </p>
        </div>
        
        <FriendsManager />
      </div>
    </div>
  );
}

