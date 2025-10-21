'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PowerUpSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Verify the session (optional - credits are added via webhook)
    // This is just for displaying confirmation to the user
    setTimeout(() => {
      setLoading(false);
      // You could fetch session details here if needed
    }, 2000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-orbitron font-bold mb-4">Oops!</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/powerups/purchase')}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Success Animation */}
        <div className="mb-8 relative">
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-green-400/20 rounded-full animate-ping" />
          </div>
        </div>

        <h1 className="text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Purchase Successful!
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          Your power-up credits have been added to your account
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-gray-700">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Zap className="w-12 h-12 text-yellow-400" />
            <div className="text-left">
              <p className="text-sm text-gray-400">Credits Added</p>
              <p className="text-4xl font-bold text-cyan-400">+{credits || '...'}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Payment processed successfully
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Credits added to your account
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Receipt sent to your email
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold px-8 py-6 text-lg">
              <Zap className="w-5 h-5 mr-2" />
              Start Using Power-Ups
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline" className="font-bold px-8 py-6 text-lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Need help? Contact support at support@robotrecruit.ai
        </p>
      </div>
    </div>
  );
}


