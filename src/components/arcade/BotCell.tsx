'use client';

import React from 'react';
import Image from 'next/image';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BotCard } from '@/lib/arcade-utils';

interface BotCellProps {
  bot: BotCard | null;
  isTarget: boolean;
  cellIndex: number;
  onClick: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function BotCell({ bot, isTarget, cellIndex, onClick, disabled }: BotCellProps) {
  const [showFeedback, setShowFeedback] = React.useState<'correct' | 'wrong' | null>(null);

  const handleClick = () => {
    if (!bot || disabled) return;
    
    const isCorrect = isTarget;
    
    // Show feedback
    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setShowFeedback(null), 300);
    
    onClick(isCorrect);
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-square rounded-lg transition-all duration-200 cursor-pointer",
        "bg-gradient-to-br from-gray-800 to-gray-900 border-2",
        bot ? "border-cyan-600/50" : "border-gray-700/30",
        !bot && "cursor-default",
        disabled && "opacity-50 cursor-not-allowed",
        showFeedback === 'correct' && "border-green-500 bg-green-500/20 scale-105",
        showFeedback === 'wrong' && "border-red-500 bg-red-500/20 animate-shake"
      )}
      onClick={handleClick}
      style={{
        animation: showFeedback === 'wrong' ? 'shake 0.2s ease-in-out' : undefined,
      }}
    >
      {/* Empty State */}
      {!bot && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot className="w-8 h-8 text-gray-700 opacity-30" />
        </div>
      )}

      {/* Bot State */}
      {bot && (
        <div 
          className={cn(
            "absolute inset-0 p-2 flex items-center justify-center",
            "animate-spawn"
          )}
        >
          <Image
            src={bot.avatarUrl}
            alt={bot.name}
            width={96}
            height={96}
            className="w-full h-full object-contain drop-shadow-lg"
          />
          
          {/* Glow effect for target bot */}
          {isTarget && (
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg animate-pulse" />
          )}
        </div>
      )}

      {/* Correct Click Feedback */}
      {showFeedback === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl font-bold text-green-400 animate-bounce">
            +100
          </div>
        </div>
      )}

      {/* Wrong Click Feedback */}
      {showFeedback === 'wrong' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl font-bold text-red-400">
            -50
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spawn {
          from {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-spawn {
          animation: spawn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}

