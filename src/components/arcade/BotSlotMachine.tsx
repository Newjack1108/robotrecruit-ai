'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
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
  onSpin: (result: string[]) => Promise<{ pointsWon: number; creditsWon: number; winType: string }>;
  disabled: boolean;
}

export function BotSlotMachine({ spinsLeft, onSpin, disabled }: BotSlotMachineProps) {
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
      
      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } else if (rewardData.winType === 'match') {
      setWinType('match');
      playWinSound();
    } else {
      setWinType('small');
      playSmallWinSound();
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
        />
      )}

      {/* Slot Machine Frame */}
      <div className="relative bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-600 rounded-3xl p-8 shadow-2xl">
        
        {/* Top Banner */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-500 px-8 py-2 rounded-full shadow-lg">
          <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider">
            🎰 BOT JACKPOT
          </h2>
        </div>

        {/* Reels Container */}
        <div className="bg-black rounded-2xl p-6 mb-6 shadow-inner">
          <div className="grid grid-cols-3 gap-4">
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

        {/* Win Message */}
        {result && !spinning && reward && (
          <div className={`mb-4 p-4 rounded-xl text-center transform transition-all duration-500 ${
            winType === 'jackpot' 
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse scale-110'
              : winType === 'match'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
              : 'bg-gray-700'
          }`}>
            <p className={`font-bold ${
              winType === 'jackpot' ? 'text-white text-3xl' : 'text-white text-xl'
            }`}>
              {winType === 'jackpot' && '🎰 JACKPOT! THREE OF A KIND! 🎰'}
              {winType === 'match' && '✨ Nice Match! Two of a kind!'}
              {winType === 'small' && 'Keep trying!'}
            </p>
            <p className="text-white font-semibold mt-2">
              +{reward.pointsWon} points
              {reward.creditsWon > 0 && ` + ${reward.creditsWon} credit!`}
            </p>
          </div>
        )}

        {/* Spin Button */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleSpin}
            disabled={spinning || disabled || spinsLeft <= 0}
            className={`
              relative px-12 py-6 text-2xl font-bold rounded-xl
              transform transition-all duration-200
              ${spinning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl'
              }
            `}
          >
            {spinning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🎰</span>
                SPINNING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-6 h-6" fill="white" />
                SPIN ({spinsLeft} left)
              </span>
            )}
          </Button>

          {/* Sound Toggle */}
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            className="p-4 rounded-full bg-gray-800 border-yellow-500 hover:bg-gray-700"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-yellow-400" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-500" />
            )}
          </Button>
        </div>

        {/* Decorative Lights */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                spinning 
                  ? 'bg-yellow-400 animate-pulse' 
                  : winType === 'jackpot'
                  ? 'bg-red-500 animate-ping'
                  : 'bg-gray-600'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                spinning 
                  ? 'bg-yellow-400 animate-pulse' 
                  : winType === 'jackpot'
                  ? 'bg-red-500 animate-ping'
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

