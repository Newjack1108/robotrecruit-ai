import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TournamentsView } from '@/components/tournaments/TournamentsView';

export default async function TournamentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Weekly Tournaments
          </h1>
          <p className="text-gray-300 text-lg">
            Compete for prizes and glory! New tournaments every week.
          </p>
        </div>
        
        <TournamentsView />
      </div>
    </div>
  );
}

