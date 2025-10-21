import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Check if user is admin (you can add an isAdmin field to your User model later)
  // For now, we'll check if email matches admin email from env
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(user.email);

  if (!isAdmin) {
    redirect('/chat');
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/30 py-3 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-orbitron font-bold text-white">Admin Panel</h1>
          </div>
              <nav className="flex gap-6 mt-4">
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Users
                </Link>
                <Link
                  href="/admin/bots"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Bots
                </Link>
                <Link
                  href="/admin/tickets"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Support Tickets
                </Link>
                <Link
                  href="/admin/promo-codes"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Promo Codes
                </Link>
                <Link
                  href="/admin/stripe"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Stripe Settings
                </Link>
                <Link
                  href="/admin/integrations"
                  className="text-gray-300 hover:text-white transition-colors font-orbitron"
                >
                  Integrations
                </Link>
              </nav>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}

