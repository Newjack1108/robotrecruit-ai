'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Timer, MousePointerClick, Star, TrendingUp } from 'lucide-react';
import { formatTime, getPerformanceRating, getBattlePerformanceRating } from '@/lib/arcade-utils';

interface GameOverModalProps {
  score: number;
  moves: number;
  timeSeconds: number;
  onRestart: () => void;
  userId: string;
  gameType?: string;
}

export function GameOverModal({
  score,
  moves,
  timeSeconds,
  onRestart,
  userId,
  gameType = 'bot_memory_match'
}: GameOverModalProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);
  const performance = gameType === 'bot_battle_arena' 
    ? getBattlePerformanceRating(score)
    : getPerformanceRating(score);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setShow(true), 100);
    
    // Generate confetti
    const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
    setConfetti(confettiPieces);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Confetti */}
        {confetti.map((i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][
                Math.floor(Math.random() * 5)
              ]
            }}
          />
        ))}

        {/* Modal */}
        <Card className={`
          relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800
          border-2 border-cyan-500/30 p-8 transform transition-all duration-500
          ${show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}>
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl" />
          
          <div className="relative space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative">
                  <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-orbitron mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-gray-300">
                {gameType === 'bot_battle_arena' ? 'Battle Complete!' : 'All Bots Matched!'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-3xl">{performance.emoji}</span>
                <span className={`text-2xl font-bold ${performance.color}`}>
                  {performance.label}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border-2 border-cyan-500/30">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Final Score</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {score}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                <MousePointerClick className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Moves</p>
                <p className="text-2xl font-bold text-cyan-400">{moves}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                <Timer className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatTime(timeSeconds)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={onRestart}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-lg text-lg transform transition-transform hover:scale-105"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={() => router.push('/arcade')}
                variant="outline"
                className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-bold py-6 rounded-lg"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Back to Arcade
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          top: -10px;
          z-index: 51;
          animation: confetti-fall 3s linear infinite;
        }
      `}</style>
    </>
  );
}

