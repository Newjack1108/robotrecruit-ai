import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, ArrowLeft } from 'lucide-react';

export default function BotNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl animate-pulse"></div>
          <Bot className="w-32 h-32 text-gray-600 relative" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-orbitron font-bold text-white">Bot Not Found</h1>
          <p className="text-xl text-gray-400">
            The bot you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <Link href="/bots">
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg py-6 px-8 rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Bots
          </Button>
        </Link>
      </div>
    </div>
  );
}



