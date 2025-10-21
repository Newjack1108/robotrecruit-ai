'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface RoundTransitionProps {
  roundNumber: number;
  message?: string;
  onContinue?: () => void;
}

export function RoundTransition({ roundNumber, message, onContinue }: RoundTransitionProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center">
        <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-orbitron mb-6 animate-bounce">
          {message || `Round ${roundNumber}`}
        </div>
        
        {message === 'Game Over!' ? (
          <div className="text-xl text-gray-300">
            Calculating your score...
          </div>
        ) : message === 'Get Ready!' && onContinue ? (
          <div className="space-y-4">
            <div className="text-xl text-gray-300 mb-6">
              Click the target bot as fast as you can!
            </div>
            <Button
              onClick={onContinue}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-6 px-12 rounded-lg text-2xl transform transition-transform hover:scale-105 group shadow-2xl"
            >
              START GAME
              <ChevronRight className="w-8 h-8 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : onContinue && (
          <Button
            onClick={onContinue}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 px-12 rounded-lg text-xl transform transition-transform hover:scale-105 group"
          >
            Start Round {roundNumber}
            <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

