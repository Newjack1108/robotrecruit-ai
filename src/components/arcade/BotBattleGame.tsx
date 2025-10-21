'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Zap, TrendingUp, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BotCell } from './BotCell';
import { TargetDisplay } from './TargetDisplay';
import { RoundTransition } from './RoundTransition';
import { 
  BATTLE_ROUND_CONFIGS, 
  GAME_BOTS,
  selectRandomBot, 
  selectMultipleBots, 
  getSpawnDuration,
  calculateClickScore,
  calculatePerfectRoundBonus,
  type BotCard 
} from '@/lib/arcade-utils';

interface BotBattleGameProps {
  onGameComplete: (score: number, moves: number, timeSeconds: number, metadata: any) => void;
  userId: string;
}

interface CellBot {
  bot: BotCard;
  spawnTime: number;
}

export function BotBattleGame({ onGameComplete, userId }: BotBattleGameProps) {
  // Game state
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'roundEnd' | 'gameOver'>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTime, setRoundTime] = useState(0);
  const [score, setScore] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [targetBot, setTargetBot] = useState<BotCard>(GAME_BOTS[0]);
  const [cellBots, setCellBots] = useState<Map<number, CellBot>>(new Map());
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [roundCorrectHits, setRoundCorrectHits] = useState(0);
  const [roundWrongHits, setRoundWrongHits] = useState(0);
  const [hitsUntilTargetChange, setHitsUntilTargetChange] = useState(4);
  
  const gameStartTime = useRef<number>(0);
  const roundStartTime = useRef<number>(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoundRef = useRef<number>(1); // Track round immediately without waiting for state update

  const [currentConfig, setCurrentConfig] = useState(BATTLE_ROUND_CONFIGS[0]);
  const [roundMaxStreak, setRoundMaxStreak] = useState(0);

  // Start spawning bots
  const startSpawning = useCallback(() => {
    const spawn = () => {
      const botsToSpawn = Math.floor(Math.random() * (currentConfig.maxBots - currentConfig.minBots + 1)) + currentConfig.minBots;
      const bots = selectMultipleBots(botsToSpawn, targetBot);
      
      // Find empty cells
      const availableCells = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !cellBots.has(i));
      
      if (availableCells.length > 0) {
        const newCellBots = new Map(cellBots);
        
        // Spawn bots in random cells
        for (let i = 0; i < Math.min(bots.length, availableCells.length); i++) {
          const cellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
          const botToSpawn = bots[i];
          
          newCellBots.set(cellIndex, {
            bot: botToSpawn,
            spawnTime: Date.now()
          });
          
          // Remove used cell
          availableCells.splice(availableCells.indexOf(cellIndex), 1);
          
          // Auto-despawn after duration
          setTimeout(() => {
            setCellBots((prev) => {
              const updated = new Map(prev);
              updated.delete(cellIndex);
              return updated;
            });
          }, getSpawnDuration());
        }
        
        setCellBots(newCellBots);
      }
    };
    
    // Initial spawn
    spawn();
    
    // Continue spawning
    spawnIntervalRef.current = setInterval(() => {
      spawn();
    }, 3000); // Spawn every 3 seconds - slower pace for better gameplay
  }, [targetBot, cellBots, currentConfig]);

  // Stop spawning
  const stopSpawning = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  // End game - defined before endRound so it can be called
  const endGame = useCallback(() => {
    console.log('[BOT_BATTLE] End game called', { score, correctHits, wrongHits });
    stopSpawning();
    setGameStatus('gameOver');
    
    const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);
    const totalMoves = correctHits + wrongHits;
    
    console.log('[BOT_BATTLE] Calling onGameComplete', { score, totalMoves, totalTime, correctHits, wrongHits, maxStreak, roundScores });
    onGameComplete(score, totalMoves, totalTime, {
      correctHits,
      wrongHits,
      perfectRounds: roundScores.filter((rs: any) => rs.wrongHits === 0 && rs.correctHits > 0).length,
      maxStreak,
      roundScores,
    });
  }, [score, correctHits, wrongHits, maxStreak, roundScores, stopSpawning, onGameComplete]);

  // End round
  const endRound = useCallback(() => {
    const round = currentRoundRef.current;
    console.log('[BOT_BATTLE] Round ended', { currentRound: round });
    stopSpawning();
    setCellBots(new Map());
    
    // Calculate round bonus
    const roundBonus = calculatePerfectRoundBonus(roundCorrectHits, roundWrongHits);
    if (roundBonus > 0) {
      setScore((prev) => prev + roundBonus);
    }
    
    setRoundScores((prev) => [...prev, score + roundBonus]);
    
    // If this was round 5, end the game immediately
    if (round >= 5) {
      console.log('[BOT_BATTLE] Round 5 complete, ending game automatically');
      // Small delay to let the score update, then end game
      setTimeout(() => {
        endGame();
      }, 500);
    } else {
      // For rounds 1-4, show the round transition
      setGameStatus('roundEnd');
    }
  }, [score, roundCorrectHits, roundWrongHits, stopSpawning, endGame]);

  // Start a new round
  const startRound = useCallback((round: number) => {
    console.log('[BOT_BATTLE] Starting round', round);
    setGameStatus('playing');
    setCurrentRound(round);
    currentRoundRef.current = round; // Use ref to track current round immediately
    const config = BATTLE_ROUND_CONFIGS[round - 1];
    setCurrentConfig(config);
    setRoundTime(config.durationSeconds);
    setRoundCorrectHits(0);
    setRoundWrongHits(0);
    setRoundMaxStreak(0);
    setHitsUntilTargetChange(config.hitsToChangeTarget);
    setCellBots(new Map());
    
    if (round === 1) {
      gameStartTime.current = Date.now();
    }
    
    roundStartTime.current = Date.now();
    
    // Start spawning bots
    startSpawning();
    
    // Start round timer
    roundTimerRef.current = setInterval(() => {
      setRoundTime((prev) => {
        if (prev <= 1) {
          endRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [startSpawning, endRound]);

  // Initialize game - set initial target bot
  useEffect(() => {
    const initialTarget = selectRandomBot();
    setTargetBot(initialTarget);
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((cellIndex: number, isCorrect: boolean) => {
    const cellBot = cellBots.get(cellIndex);
    if (!cellBot) return;
    
    const reactionTime = Date.now() - cellBot.spawnTime;
    const clickScore = calculateClickScore(isCorrect, reactionTime, currentStreak);
    
    setScore((prev) => prev + clickScore);
    setTotalClicks((prev) => prev + 1);
    
    if (isCorrect) {
      setCorrectHits((prev) => prev + 1);
      setRoundCorrectHits((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });
      
      // Change target after N hits
      setHitsUntilTargetChange((prev) => {
        if (prev <= 1) {
          const newTarget = selectRandomBot(targetBot);
          setTargetBot(newTarget);
          return currentConfig.hitsToChangeTarget;
        }
        return prev - 1;
      });
      
      // Remove clicked bot immediately
      setCellBots((prev) => {
        const updated = new Map(prev);
        updated.delete(cellIndex);
        return updated;
      });
    } else {
      setWrongHits((prev) => prev + 1);
      setRoundWrongHits((prev) => prev + 1);
      setCurrentStreak(0);
    }
  }, [cellBots, currentStreak, targetBot, currentConfig]);

  // Handle continuing to next round (only used for rounds 1-4)
  const handleContinueToNextRound = useCallback(() => {
    const round = currentRoundRef.current;
    console.log('[BOT_BATTLE] Continue to next round clicked', { currentRound: round, nextRound: round + 1 });
    
    // Select new target and start next round
    const newTarget = selectRandomBot();
    setTargetBot(newTarget);
    startRound(round + 1);
  }, [startRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpawning();
    };
  }, [stopSpawning]);

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-cyan-700/50">
      {/* Target Display */}
      {gameStatus === 'playing' && (
        <TargetDisplay targetBot={targetBot} />
      )}
      
      {/* Game Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cellIndex) => {
          const cellBot = cellBots.get(cellIndex);
          return (
            <BotCell
              key={cellIndex}
              bot={cellBot?.bot || null}
              isTarget={cellBot?.bot.id === targetBot.id}
              cellIndex={cellIndex}
              onClick={(isCorrect) => handleCellClick(cellIndex, isCorrect)}
              disabled={gameStatus !== 'playing'}
            />
          );
        })}
      </div>
      
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>Time</span>
          </div>
          <p className="text-xl font-bold text-cyan-400">{roundTime}s</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
            <Award className="w-3 h-3" />
            <span>Round</span>
          </div>
          <p className="text-xl font-bold text-white">{currentRound}/5</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
            <Zap className="w-3 h-3" />
            <span>Streak</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{currentStreak}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Score</span>
          </div>
          <p className="text-xl font-bold text-cyan-300">{score}</p>
        </div>
      </div>
      
      {/* End Game Early Button */}
      {gameStatus === 'playing' && (
        <div className="mt-4 text-center">
          <Button
            onClick={endGame}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <X className="w-4 h-4 mr-2" />
            End Game
          </Button>
        </div>
      )}
      
      {/* Round Transition Overlay */}
      {gameStatus === 'ready' && (
        <RoundTransition 
          roundNumber={1} 
          message="Get Ready!" 
          onContinue={() => startRound(1)}
        />
      )}
      
      {gameStatus === 'roundEnd' && currentRound < 5 && (
        <RoundTransition 
          roundNumber={currentRound + 1} 
          onContinue={handleContinueToNextRound}
        />
      )}
      
      {gameStatus === 'gameOver' && (
        <RoundTransition roundNumber={5} message="Game Over!" />
      )}
    </div>
  );
}

