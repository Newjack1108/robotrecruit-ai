'use client';

import { CheckCircle, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function BotCapabilitiesCard() {
  return (
    <div className="space-y-4">
      {/* Capabilities Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h4 className="text-lg font-orbitron font-bold text-cyan-300 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 animate-pulse" />
            BOT CAPABILITIES
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">Natural Language</span>
            </div>
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">Context Memory</span>
            </div>
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">Instant Response</span>
            </div>
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">Multi-Language</span>
            </div>
            <div className="flex items-center gap-2 text-sm group">
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300">Smart Learning</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade CTA */}
      <Link href="/powerups/purchase">
        <div className="group relative overflow-hidden rounded-xl border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-yellow-900/30 p-5 hover:border-yellow-400 transition-all cursor-pointer hover:scale-105 duration-300 shadow-lg hover:shadow-yellow-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <p className="font-orbitron font-bold text-yellow-300 mb-1 text-lg">⚡ Get Power-Up Credits!</p>
              <p className="text-sm text-gray-300">1 credit = 1 powerup per conversation • All features unlocked</p>
              <p className="text-xs text-yellow-200 mt-1">💡 Powerups persist in conversation history automatically</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 blur-xl animate-pulse" />
              <Sparkles className="w-10 h-10 text-yellow-400 group-hover:scale-110 group-hover:rotate-12 transition-transform relative" />
            </div>
          </div>
          
          {/* Animated corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </div>
  );
}

