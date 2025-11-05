'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, X, Sparkles, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SlotReel from './SlotReel';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

const BOTS = [
  'boss-bot', 'bee-bot', 'chef-bot', 'art-bot', 'fishing-bot',
  'garden-bot', 'fit-bot', 'game-bot', 'melody-bot', 'scout-bot',
  'equi-bot', 'diy-bot', 'brewster-bot'
];

interface BotSlotMachineProps {
  spinsLeft: number;
  onSpin: (result: string[]) => Promise<{ pointsWon: number; creditsWon: number; winType: string; isLastSpin: boolean; sessionTotal: number; sessionCredits: number }>;
  disabled: boolean;
  sessionSpins: Array<{winType: string, points: number, credits: number}>;
  totalPoints: number;
  totalCredits: number;
}

export function BotSlotMachine({ spinsLeft, onSpin, disabled, sessionSpins, totalPoints, totalCredits }: BotSlotMachineProps) {
  const [reels, setReels] = useState<string[][]>([
    getRandomBots(3),
    getRandomBots(3),
    getRandomBots(3)
  ]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winType, setWinType] = useState<'jackpot' | 'match' | 'small' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reward, setReward] = useState<{ pointsWon: number; creditsWon: number } | null>(null);
  const [showInlineNotification, setShowInlineNotification] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const { width, height } = useWindowSize();

  // Web Audio API for sounds (no external files needed)
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  function getRandomBots(count: number): string[] {
    return Array.from({ length: count }, () => 
      BOTS[Math.floor(Math.random() * BOTS.length)]
    );
  }

  const playBeep = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled || !audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const playSpinSound = () => {
    // Rapid ascending beeps for spin sound
    if (!soundEnabled) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playBeep(400 + i * 100, 0.1, 'square'), i * 100);
    }
  };

  const playJackpotSound = () => {
    // Ascending triumph sound
    if (!soundEnabled) return;
    const notes = [523, 659, 784, 1047]; // C, E, G, high C
    notes.forEach((note, i) => {
      setTimeout(() => playBeep(note, 0.3, 'triangle'), i * 150);
    });
  };

  const playWinSound = () => {
    // Two-tone win chime
    if (!soundEnabled) return;
    playBeep(800, 0.15, 'sine');
    setTimeout(() => playBeep(1000, 0.2, 'sine'), 100);
  };

  const playSmallWinSound = () => {
    // Single beep
    if (!soundEnabled) return;
    playBeep(600, 0.1, 'sine');
  };

  const handleSpin = async () => {
    if (spinning || disabled || spinsLeft <= 0) return;

    setSpinning(true);
    setResult(null);
    setWinType(null);
    setShowConfetti(false);
    setReward(null);
    setShowInlineNotification(false);

    // Play spin sound
    playSpinSound();

    // Simulate spinning for 2 seconds
    const spinDuration = 2000;
    const spinInterval = 100;
    let elapsed = 0;

    const spinTimer = setInterval(() => {
      setReels([
        getRandomBots(3),
        getRandomBots(3),
        getRandomBots(3)
      ]);
      elapsed += spinInterval;

      if (elapsed >= spinDuration) {
        clearInterval(spinTimer);
        finishSpin();
      }
    }, spinInterval);
  };

  const finishSpin = async () => {
    // Generate final result
    const finalResult = [
      BOTS[Math.floor(Math.random() * BOTS.length)],
      BOTS[Math.floor(Math.random() * BOTS.length)],
      BOTS[Math.floor(Math.random() * BOTS.length)]
    ];

    setReels([
      [finalResult[0], finalResult[0], finalResult[0]],
      [finalResult[1], finalResult[1], finalResult[1]],
      [finalResult[2], finalResult[2], finalResult[2]]
    ]);

    setResult(finalResult);

    // Submit to backend
    const rewardData = await onSpin(finalResult);
    setReward(rewardData);

    // Determine win type and play appropriate sound/effect
    if (rewardData.winType === 'jackpot') {
      setWinType('jackpot');
      setShowConfetti(true);
      playJackpotSound();
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (rewardData.winType === 'match') {
      setWinType('match');
      playWinSound();
    } else {
      setWinType('small');
      playSmallWinSound();
    }

    // Show inline notification briefly
    setShowInlineNotification(true);
    setTimeout(() => setShowInlineNotification(false), 2500);

    // If this was the last spin, show final summary after a brief delay
    if (rewardData.isLastSpin) {
      setTimeout(() => {
        setShowFinalSummary(true);
      }, 3000);
    }

    setSpinning(false);
  };

  return (
    <div className="relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316']}
        />
      )}

      {/* Inline Notification - Quick Feedback */}
      {showInlineNotification && reward && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl border-2 ${
            winType === 'jackpot'
              ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-300'
              : winType === 'match'
              ? 'bg-gradient-to-r from-cyan-500/90 to-blue-500/90 border-cyan-300'
              : 'bg-gray-800/90 border-gray-600'
          }`}>
            <div className="flex items-center gap-3">
              {winType === 'jackpot' && <Trophy className="w-6 h-6 text-white animate-bounce" />}
              {winType === 'match' && <Sparkles className="w-6 h-6 text-white" />}
              {winType === 'small' && <Zap className="w-5 h-5 text-gray-300" />}
              <div className="text-white font-bold">
                {winType === 'jackpot' && '🎰 JACKPOT! '}
                {winType === 'match' && '✨ Match! '}
                +{reward.pointsWon} pts
                {reward.creditsWon > 0 && ` + ${reward.creditsWon} 💎`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Session Summary Modal */}
      {showFinalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl p-8 shadow-2xl transform animate-in zoom-in duration-500">
            {/* Holographic glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-2xl animate-pulse rounded-2xl"></div>
            
            <div className="relative z-10">
              {/* Close button */}
              <button
                onClick={() => setShowFinalSummary(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-orbitron font-bold text-white mb-2">
                  🎰 Session Complete! 🎰
                </h3>
                <p className="text-white/90 text-lg">
                  All 10 spins used!
                </p>
              </div>

              {/* Session Stats */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20 space-y-4">
                <div className="text-center pb-4 border-b border-white/20">
                  <div className="text-5xl font-bold text-white mb-1">{totalPoints}</div>
                  <div className="text-white/80">Total Points Earned</div>
                  <div className="text-sm text-cyan-200 mt-2">✨ Added to leaderboard!</div>
                </div>
                
                {totalCredits > 0 && (
                  <div className="text-center pb-4 border-b border-white/20">
                    <div className="text-4xl font-bold text-yellow-300 flex items-center justify-center gap-2">
                      💎 {totalCredits}
                    </div>
                    <div className="text-white/80">Powerup Credits Earned</div>
                  </div>
                )}

                {/* Breakdown */}
                <div className="space-y-2">
                  <div className="text-white/80 text-sm font-semibold mb-2">Spin Breakdown:</div>
                  {(() => {
                    const jackpots = sessionSpins.filter(s => s.winType === 'jackpot').length;
                    const matches = sessionSpins.filter(s => s.winType === 'match').length;
                    const small = sessionSpins.filter(s => s.winType === 'small').length;
                    return (
                      <>
                        {jackpots > 0 && (
                          <div className="flex justify-between text-yellow-300">
                            <span>🎰 Jackpots:</span>
                            <span className="font-bold">{jackpots}</span>
                          </div>
                        )}
                        {matches > 0 && (
                          <div className="flex justify-between text-cyan-300">
                            <span>✨ Matches:</span>
                            <span className="font-bold">{matches}</span>
                          </div>
                        )}
                        {small > 0 && (
                          <div className="flex justify-between text-gray-300">
                            <span>⚡ Small Wins:</span>
                            <span className="font-bold">{small}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Action button */}
              <Button
                onClick={() => setShowFinalSummary(false)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl backdrop-blur-sm border border-white/30 transition-all"
              >
                View Leaderboard
              </Button>
            </div>

            {/* Animated particles */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-16 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-16 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      )}

      {/* Slot Machine Frame - NEW COLORS */}
      <div className="relative bg-gradient-to-b from-cyan-600 via-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
        
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 animate-pulse pointer-events-none"></div>
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Top Banner - NEW COLORS */}
        <div className="relative z-10 flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-8 py-3 rounded-full shadow-lg border-2 border-cyan-400/50">
            <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider flex items-center gap-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
              BOT JACKPOT
              <Sparkles className="w-6 h-6 animate-pulse" />
            </h2>
          </div>
        </div>

        {/* Reels Container - Enhanced */}
        <div className="relative z-10 bg-black/60 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-inner border-2 border-cyan-500/30">
          {/* Neon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl rounded-2xl"></div>
          
          <div className="relative grid grid-cols-3 gap-4">
            {reels.map((reel, i) => (
              <SlotReel
                key={i}
                bots={reel}
                spinning={spinning}
                delay={i * 200}
                isWinner={!!(result && (
                  (result[0] === result[1] && result[1] === result[2]) ||
                  (i < 2 && result[i] === result[i + 1]) ||
                  (i > 0 && result[i] === result[i - 1])
                ))}
              />
            ))}
          </div>
        </div>

        {/* Spin Button - NEW COLORS */}
        <div className="relative z-10 flex items-center justify-center gap-4">
          <Button
            onClick={handleSpin}
            disabled={spinning || disabled || spinsLeft <= 0}
            className={`
              relative px-12 py-6 text-2xl font-bold rounded-xl
              transform transition-all duration-200 overflow-hidden
              ${spinning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50'
              }
            `}
          >
            {/* Button glow effect */}
            {!spinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl animate-pulse"></div>
            )}
            
            <span className="relative flex items-center gap-2">
              {spinning ? (
                <>
                  <span className="animate-spin">🎰</span>
                  SPINNING...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" fill="white" />
                  SPIN ({spinsLeft} left)
                </>
              )}
            </span>
          </Button>

          {/* Sound Toggle - NEW COLORS */}
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            className="p-4 rounded-full bg-cyan-900/50 border-2 border-cyan-500 hover:bg-cyan-800/50 backdrop-blur-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-cyan-400" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-500" />
            )}
          </Button>
        </div>

        {/* Decorative Neon Lights - NEW COLORS */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                spinning 
                  ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse' 
                  : winType === 'jackpot'
                  ? 'bg-purple-500 shadow-lg shadow-purple-500/50 animate-ping'
                  : 'bg-gray-600'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                spinning 
                  ? 'bg-purple-400 shadow-lg shadow-purple-400/50 animate-pulse' 
                  : winType === 'jackpot'
                  ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-ping'
                  : 'bg-gray-600'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
