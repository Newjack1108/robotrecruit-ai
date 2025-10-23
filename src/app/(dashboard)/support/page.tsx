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

      {/* Legal Links Section */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            Need help with legal matters or have questions about our policies?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 text-sm">
            <a href="/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-cyan-400 transition-colors">
              Terms & Conditions
            </a>
            <span>•</span>
            <a href="/disclaimer" className="hover:text-cyan-400 transition-colors">
              Disclaimer
            </a>
            <span>•</span>
            <a href="/cookies" className="hover:text-cyan-400 transition-colors">
              Cookie Policy
            </a>
          </div>
          <p className="text-gray-500 text-xs">
            Contact: <a href="mailto:service@robotrecruit.ai" className="text-cyan-400 hover:underline">service@robotrecruit.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}



