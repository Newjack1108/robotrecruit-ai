'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Heart, Trophy, Clock } from 'lucide-react';
import {
  GameState,
  GameData,
  initializeGame,
  queuePlayerDirection,
  updatePlayerMovement,
  handleTileCollision,
  handleBugCollisions,
  updateBugsMovement,
  updateInvincibility,
  updatePowerUp,
  updateTimer,
  checkWinCondition,
  calculateFinalScore,
  getPerformanceRating,
} from '@/lib/bot-runner-engine';
import {
  MAZE_WIDTH,
  MAZE_HEIGHT,
  TILE_SIZE,
  TileType,
  Position,
} from '@/lib/bot-runner-maze';
import { soundManager } from '@/lib/bot-runner-sounds';
import { ParticleSystem, Particle, createExplosion, createSparkles, createTrailParticle, updateParticles } from './ParticleSystem';
import { ScorePopup, ScorePopupData } from './ScorePopup';
import { ScreenEffects } from './ScreenEffects';

interface BotRunnerGameProps {
  onGameOver: (score: number, stats: any) => void;
}

export function BotRunnerGame({ onGameOver }: BotRunnerGameProps) {
  const [game, setGame] = useState<GameData>(initializeGame());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  const [showInstructions, setShowInstructions] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [screenFlash, setScreenFlash] = useState<{ color: string; duration: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const previousGameRef = useRef<GameData>(game);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (game.state !== GameState.PLAYING) return;

    let direction: Position | null = null;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = { x: 1, y: 0 };
        break;
      case 'p':
      case 'P':
      case ' ':
        togglePause();
        return;
    }

    if (direction) {
      e.preventDefault();
      setGame(prev => queuePlayerDirection(prev, direction!));
    }
  }, [game.state]);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update particles
  useEffect(() => {
    const particleInterval = setInterval(() => {
      setParticles(prev => updateParticles(prev));
    }, 16);

    return () => clearInterval(particleInterval);
  }, []);

  // Detect game events and trigger effects
  useEffect(() => {
    const prev = previousGameRef.current;
    const curr = game;

    // Task collected
    if (curr.tasksCollected > prev.tasksCollected) {
      soundManager.playTaskCollect();
      // No popup for tasks - too distracting
    }

    // Power-up collected
    if (curr.powerUpActive && !prev.powerUpActive) {
      soundManager.playPowerUpPickup();
      setScreenFlash({ color: '#fbbf24', duration: 200 });
      const playerPos = {
        x: curr.player.visualPosition.x * TILE_SIZE + TILE_SIZE / 2,
        y: curr.player.visualPosition.y * TILE_SIZE + TILE_SIZE / 2,
      };
      setParticles(p => [...p, ...createSparkles(playerPos.x, playerPos.y, 15)]);
      // No popup - sparkles and flash are enough feedback
    }

    // Bug eaten
    if (curr.bugsDebugged > prev.bugsDebugged) {
      soundManager.playBugEaten();
      const playerPos = {
        x: curr.player.visualPosition.x * TILE_SIZE + TILE_SIZE / 2,
        y: curr.player.visualPosition.y * TILE_SIZE + TILE_SIZE / 2,
      };
      setParticles(p => [...p, ...createExplosion(playerPos.x, playerPos.y, '#a855f7', 15)]);
      // No popup - explosion particles are enough feedback
    }

    // Life lost
    if (curr.player.lives < prev.player.lives && curr.player.lives > 0) {
      soundManager.playDeath();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 200);
    }

    // Power-up warning (2 seconds remaining)
    if (curr.powerUpActive && curr.powerUpTimeRemaining <= 2000 && prev.powerUpTimeRemaining > 2000) {
      soundManager.playPowerUpWarning();
    }

    // Game over
    if (curr.state === GameState.GAME_OVER && prev.state !== GameState.GAME_OVER) {
      const isWin = curr.tasksCollected === curr.totalTasks;
      soundManager.playGameOver(isWin);
    }

    // Create power-up trail
    if (curr.powerUpActive && curr.state === GameState.PLAYING) {
      const playerPos = {
        x: curr.player.visualPosition.x * TILE_SIZE + TILE_SIZE / 2,
        y: curr.player.visualPosition.y * TILE_SIZE + TILE_SIZE / 2,
      };
      if (Math.random() < 0.3) {
        setParticles(p => [...p, createTrailParticle(playerPos.x, playerPos.y, '#fbbf24')]);
      }
    }

    previousGameRef.current = curr;
  }, [game]);

  // Main game loop
  useEffect(() => {
    if (game.state !== GameState.PLAYING) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setGame(prev => {
        let updated = { ...prev };

        // Update timers
        updated = updateTimer(updated, deltaTime);
        updated = updatePowerUp(updated, deltaTime);
        updated = updateInvincibility(updated);

        // Update smooth player movement
        updated = updatePlayerMovement(updated, deltaTime);
        
        // Update smooth bug movement
        updated = updateBugsMovement(updated, deltaTime);

        // Check collisions (use logical positions)
        updated = handleTileCollision(updated);
        updated = handleBugCollisions(updated);

        // Check win condition
        updated = checkWinCondition(updated);

        // Check game over
        if (updated.state === GameState.GAME_OVER) {
          const finalScore = calculateFinalScore(updated);
          const rating = getPerformanceRating(updated);
          
          setTimeout(() => {
            onGameOver(finalScore, {
              tasksCollected: updated.tasksCollected,
              totalTasks: updated.totalTasks,
              bugsDebugged: updated.bugsDebugged,
              livesRemaining: updated.player.lives,
              timeRemaining: Math.floor((updated.timeLimit - updated.timeElapsed) / 1000),
              rating,
            });
          }, 500);
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [game.state, onGameOver]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const tile = game.maze[y][x];

        if (tile === TileType.WALL) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.TASK) {
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (tile === TileType.POWER_UP) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw bugs with smooth movement
    game.bugs.forEach(bug => {
      const x = bug.visualPosition.x * TILE_SIZE + TILE_SIZE / 2;
      const y = bug.visualPosition.y * TILE_SIZE + TILE_SIZE / 2;
      
      const color = game.powerUpActive ? '#60a5fa' : '#ef4444';
      
      // Glow effect
      if (!game.powerUpActive) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Eyes
      if (!game.powerUpActive) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 4, y - 2, 3, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils (follow player direction)
        ctx.fillStyle = '#000000';
        const lookX = bug.direction.x * 1.5;
        const lookY = bug.direction.y * 1.5;
        ctx.beginPath();
        ctx.arc(x - 4 + lookX, y - 2 + lookY, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 4 + lookX, y - 2 + lookY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw player with smooth movement and glow
    if (!game.player.invincible || Math.floor(Date.now() / 200) % 2 === 0) {
      const x = game.player.visualPosition.x * TILE_SIZE + TILE_SIZE / 2;
      const y = game.player.visualPosition.y * TILE_SIZE + TILE_SIZE / 2;
      
      // Power-up glow
      if (game.powerUpActive) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24';
      } else {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';
      }
      
      ctx.fillStyle = game.powerUpActive ? '#fbbf24' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // Direction indicator (mouth)
      const mouthAngle = Math.PI / 6;
      const dir = game.player.direction;
      let angle = 0;
      if (dir.x === 1) angle = 0;
      else if (dir.x === -1) angle = Math.PI;
      else if (dir.y === -1) angle = -Math.PI / 2;
      else if (dir.y === 1) angle = Math.PI / 2;
      
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 14, angle - mouthAngle, angle + mouthAngle);
      ctx.lineTo(x, y);
      ctx.fill();
    }
  }, [game]);

  const startGame = () => {
    setShowInstructions(false);
    soundManager.playGameStart();
    
    // Countdown: 3, 2, 1, GO!
    setCountdown(3);
    setTimeout(() => setCountdown(2), 1000);
    setTimeout(() => setCountdown(1), 2000);
    setTimeout(() => setCountdown(0), 3000);
    setTimeout(() => {
      setCountdown(null);
      setGame(prev => ({ ...prev, state: GameState.PLAYING }));
      lastUpdateRef.current = Date.now();
    }, 3500);
  };

  const togglePause = () => {
    setGame(prev => ({
      ...prev,
      state: prev.state === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING,
    }));
  };

  const resetGame = () => {
    setGame(initializeGame());
    setShowInstructions(true);
    setParticles([]);
    setScorePopups([]);
    setScreenShake(false);
    setScreenFlash(null);
    setCountdown(null);
    lastUpdateRef.current = Date.now();
    previousGameRef.current = initializeGame();
  };

  const removeParticle = (id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  const removePopup = (id: string) => {
    setScorePopups(prev => prev.filter(p => p.id !== id));
  };

  const timeRemaining = Math.max(0, Math.floor((game.timeLimit - game.timeElapsed) / 1000));

  return (
    <div className="flex flex-col items-center gap-4 game-container">
      {/* Screen Effects */}
      <ScreenEffects shake={screenShake} flash={screenFlash} countdown={countdown} />

      {/* Stats Bar */}
      <div className="w-full max-w-[640px] bg-gray-900/80 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{game.score}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${i < game.player.lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400">Lives</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {game.tasksCollected}/{game.totalTasks}
            </div>
            <div className="text-xs text-gray-400">Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{timeRemaining}s</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
        </div>

        {/* Power-up indicator */}
        {game.powerUpActive && (
          <div className="mt-3 text-center">
            <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-1">
              <span className="text-yellow-400 font-bold text-sm">
                ⚡ POWER-UP ACTIVE! {Math.ceil(game.powerUpTimeRemaining / 1000)}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={MAZE_WIDTH * TILE_SIZE}
          height={MAZE_HEIGHT * TILE_SIZE}
          className="border-4 border-cyan-500/30 rounded-lg bg-gray-950 max-w-full h-auto"
          style={{
            maxHeight: 'calc(100vh - 300px)',
            width: 'auto',
            imageRendering: 'pixelated',
          }}
        />

        {/* Touch Zone Overlay for Mobile - Tap to Control Direction */}
        {game.state === GameState.PLAYING && (
          <div
            className="md:hidden absolute inset-0 touch-none"
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              
              // Get touch position relative to overlay
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              
              // Get center of overlay
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              
              // Calculate distances from center
              const dx = x - centerX;
              const dy = y - centerY;
              
              // Determine direction based on which distance is greater
              let direction: Position;
              if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal movement (left or right)
                direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
              } else {
                // Vertical movement (up or down)
                direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
              }
              
              setGame(prev => queuePlayerDirection(prev, direction));
            }}
          />
        )}

        {/* Particle System */}
        <ParticleSystem particles={particles} onParticleEnd={removeParticle} />

        {/* Score Popups */}
        <ScorePopup popups={scorePopups} onPopupEnd={removePopup} />

        {/* Overlays */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4 p-6 max-w-md">
              <h3 className="text-2xl font-bold text-cyan-400">Bot Runner</h3>
              <div className="text-left space-y-2 text-sm text-gray-300">
                <p>🎯 <strong>Collect all task tokens</strong> (cyan dots)</p>
                <p>⭐ <strong>Grab power-ups</strong> (yellow stars) to debug bugs!</p>
                <p>🐛 <strong>Avoid bug bots</strong> or lose a life</p>
                <p>⌨️ <strong>Desktop:</strong> Arrow keys or WASD</p>
                <p>📱 <strong>Mobile:</strong> Tap screen edges to move (or use D-pad in corner)</p>
                <p>⏸️ <strong>Pause:</strong> P, Space, or tap pause button</p>
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          </div>
        )}

        {game.state === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-white">PAUSED</h3>
              <Button onClick={togglePause} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {game.state === GameState.PLAYING && (
          <Button onClick={togglePause} variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>

      {/* Mobile Touch Controls - Optional D-Pad (backup for tap controls) */}
      {game.state === GameState.PLAYING && (
        <div className="md:hidden fixed bottom-4 right-4 z-50 opacity-70">
          {/* D-Pad Controls */}
          <div className="relative w-28 h-28">
            {/* Up */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                setGame(prev => queuePlayerDirection(prev, { x: 0, y: -1 }));
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 bg-cyan-500/70 active:bg-cyan-400 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-lg active:scale-95 transition-all touch-none"
            >
              ▲
            </button>
            
            {/* Left */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                setGame(prev => queuePlayerDirection(prev, { x: -1, y: 0 }));
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-cyan-500/70 active:bg-cyan-400 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-lg active:scale-95 transition-all touch-none"
            >
              ◄
            </button>
            
            {/* Center (Pause) */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                togglePause();
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-gray-800/70 active:bg-gray-700 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all touch-none border-2 border-cyan-500/40"
            >
              <Pause className="w-4 h-4" />
            </button>
            
            {/* Right */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                setGame(prev => queuePlayerDirection(prev, { x: 1, y: 0 }));
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-cyan-500/70 active:bg-cyan-400 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-lg active:scale-95 transition-all touch-none"
            >
              ►
            </button>
            
            {/* Down */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                setGame(prev => queuePlayerDirection(prev, { x: 0, y: 1 }));
              }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 bg-cyan-500/70 active:bg-cyan-400 rounded-lg flex items-center justify-center text-white text-base font-bold shadow-lg active:scale-95 transition-all touch-none"
            >
              ▼
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

