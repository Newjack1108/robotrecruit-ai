'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BotBattleGame } from '@/components/arcade/BotBattleGame';
import { GameOverModal } from '@/components/arcade/GameOverModal';

export interface BotBattleGameClientProps {
  userId: string;
}

export function BotBattleGameClient({ userId }: BotBattleGameClientProps) {
  console.log('[BOT_BATTLE_CLIENT] Component mounted/rendered');
  const router = useRouter();
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMoves, setFinalMoves] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log('[BOT_BATTLE_CLIENT] State:', { gameComplete, finalScore, finalMoves, finalTime });

  const handleGameComplete = async (
    score: number,
    moves: number,
    timeSeconds: number,
    metadata: any
  ) => {
    console.log('[BOT_BATTLE_CLIENT] Game complete received', { score, moves, timeSeconds });
    setFinalScore(score);
    setFinalMoves(moves);
    setFinalTime(timeSeconds);
    setGameComplete(true);
    setIsSubmitting(true);

    try {
      // Submit score to API
      const response = await fetch('/api/arcade/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'bot_battle_arena',
          score,
          moves,
          timeSeconds,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      console.log('[BOT_BATTLE_CLIENT] Score submitted successfully');
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    router.refresh();
  };

  return (
    <>
      {/* DEBUG INFO - REMOVE AFTER TESTING */}
      <div className="fixed top-4 right-4 z-[100] bg-red-500 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
        <div className="font-bold mb-2">DEBUG v2.0</div>
        <div>Complete: {gameComplete ? 'TRUE ✅' : 'FALSE ❌'}</div>
        <div>Score: {finalScore}</div>
        <div>Moves: {finalMoves}</div>
        <div>Time: {finalTime}s</div>
        <div className="mt-2 text-yellow-200">
          {gameComplete ? 'Modal should show!' : 'Game in progress'}
        </div>
      </div>
      
      {gameComplete ? (
        <GameOverModal
          score={finalScore}
          moves={finalMoves}
          timeSeconds={finalTime}
          onRestart={handleRestart}
          userId={userId}
          gameType="bot_battle_arena"
        />
      ) : (
        <BotBattleGame onGameComplete={handleGameComplete} userId={userId} />
      )}
    </>
  );
}

