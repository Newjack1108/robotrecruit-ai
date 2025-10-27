'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BotRunnerGame } from '@/components/arcade/BotRunnerGame';
import { BotRunnerGameOverModal } from '@/components/arcade/BotRunnerGameOverModal';

export default function BotRunnerPage() {
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameStats, setGameStats] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleGameOver = async (score: number, stats: any) => {
    setFinalScore(score);
    setGameStats(stats);
    setGameOver(true);

    // Submit score to backend
    try {
      setSubmitting(true);
      const response = await fetch('/api/arcade/bot-runner/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          tasksCollected: stats.tasksCollected,
          totalTasks: stats.totalTasks,
          bugsDebugged: stats.bugsDebugged,
          timeRemaining: stats.timeRemaining,
          livesRemaining: stats.livesRemaining,
        }),
      });

      if (response.ok) {
        console.log('Score submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    setGameKey(prev => prev + 1); // Force remount of game component
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/arcade">
            <Button variant="outline" className="border-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </Link>
          <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
            Bot Runner
          </h1>
          <div className="w-[140px]" /> {/* Spacer for centering */}
        </div>

        {/* Game */}
        <div className="flex justify-center">
          <BotRunnerGame key={gameKey} onGameOver={handleGameOver} />
        </div>

        {/* How to Play */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Controls</h3>
              <ul className="space-y-1">
                <li>⌨️ Arrow Keys or WASD to move</li>
                <li>⏸️ P or Space to pause</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Gameplay</h3>
              <ul className="space-y-1">
                <li>🎯 Collect all task tokens (cyan dots)</li>
                <li>⭐ Grab power-ups to debug bugs</li>
                <li>🐛 Avoid bugs or lose a life</li>
                <li>⏱️ Complete within 2 minutes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Scoring</h3>
              <ul className="space-y-1">
                <li>+10 points per task</li>
                <li>+200 points per bug debugged</li>
                <li>+1 point per second remaining</li>
                <li>+1000 bonus for completion</li>
                <li>+5000 bonus for perfect run (no lives lost)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Tips</h3>
              <ul className="space-y-1">
                <li>💡 Use side tunnels to escape bugs</li>
                <li>💡 Bugs get faster as you collect more</li>
                <li>💡 Power-ups last 7 seconds</li>
                <li>💡 Plan your route to maximize score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && gameStats && (
        <BotRunnerGameOverModal
          score={finalScore}
          stats={gameStats}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

