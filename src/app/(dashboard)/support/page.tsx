import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { TicketForm } from '@/components/support/TicketForm';
import { TicketList } from '@/components/support/TicketList';
import { Headphones } from 'lucide-react';

export default async function SupportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-full border-2 border-cyan-500/50">
            <Headphones className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-4xl font-orbitron font-bold text-white">Support Center</h1>
        <p className="text-xl text-gray-400">
          Need help? We're here for you 24/7. Submit a ticket and our team will respond quickly!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submit Ticket */}
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4">Submit a Ticket</h2>
          <TicketForm />
        </div>

        {/* My Tickets */}
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4">My Tickets</h2>
          <TicketList />
        </div>
      </div>
    </div>
  );
}



