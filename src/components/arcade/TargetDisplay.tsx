'use client';

import React from 'react';
import Image from 'next/image';
import { Target } from 'lucide-react';
import type { BotCard } from '@/lib/arcade-utils';

interface TargetDisplayProps {
  targetBot: BotCard;
}

export function TargetDisplay({ targetBot }: TargetDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-cyan-400">
        <Target className="w-5 h-5 animate-pulse" />
        <h3 className="text-lg font-orbitron font-bold">TARGET</h3>
        <Target className="w-5 h-5 animate-pulse" />
      </div>
      
      <div className="relative">
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        {/* Bot avatar */}
        <div className="relative w-24 h-24 rounded-full border-4 border-cyan-400 bg-gray-800 p-2 shadow-2xl shadow-cyan-500/50">
          <Image
            src={targetBot.avatarUrl}
            alt={targetBot.name}
            width={96}
            height={96}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-white font-orbitron">{targetBot.name}</p>
        <p className="text-sm text-gray-400">Click when you see this bot!</p>
      </div>
    </div>
  );
}

