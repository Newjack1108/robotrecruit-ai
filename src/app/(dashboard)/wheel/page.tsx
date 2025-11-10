import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DailyRewardWheel } from '@/components/wheel/DailyRewardWheel';

export default async function WheelPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <DailyRewardWheel />
      </div>
    </div>
  );
}

