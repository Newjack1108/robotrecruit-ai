'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BotMemoryGame } from '@/components/arcade/BotMemoryGame';
import { GameOverModal } from '@/components/arcade/GameOverModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BotMemoryGamePage() {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResults, setGameResults] = useState({
    score: 0,
    moves: 0,
    timeSeconds: 0
  });

  const handleGameComplete = async (score: number, moves: number, timeSeconds: number) => {
    setGameResults({ score, moves, timeSeconds });
    
    // Submit score to backend
    try {
      await fetch('/api/arcade/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'bot_memory_match',
          score,
          moves,
          timeSeconds,
          difficulty: 'normal',
          metadata: {
            totalPairs: 6,
            perfect: moves === 6
          }
        })
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }

    // Show game over modal
    setShowGameOver(true);
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    setGameKey(prev => prev + 1); // Force re-render with new game
  };

  const handleViewLeaderboard = () => {
    router.push('/arcade');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/arcade">
            <Button
              variant="outline"
              className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Bot Memory Match
          </h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        {/* Game */}
        <BotMemoryGame key={gameKey} onGameComplete={handleGameComplete} />
      </div>

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          score={gameResults.score}
          moves={gameResults.moves}
          timeSeconds={gameResults.timeSeconds}
          onPlayAgain={handlePlayAgain}
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
    </div>
  );
}

