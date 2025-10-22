'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LockedPowerUpCardProps {
  emoji: string;
  label: string;
  description: string;
}

export function LockedPowerUpCard({ emoji, label, description }: LockedPowerUpCardProps) {
  return (
    <Link href="/powerups/purchase">
      <div className="relative group overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105 duration-300">
        {/* Lock Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-100 group-hover:opacity-80 transition-opacity z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/30 blur-xl animate-pulse" />
            <Lock className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform relative" />
          </div>
        </div>
        
        {/* Content (blurred in background) */}
        <div className="text-center space-y-2 opacity-40">
          <div className="text-3xl group-hover:scale-110 transition-transform">{emoji}</div>
          <p className="text-xs font-orbitron font-bold text-white">{label}</p>
          <p className="text-[10px] text-gray-400">{description}</p>
        </div>
        
        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        {/* Corner Accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-xl" />
      </div>
    </Link>
  );
}

