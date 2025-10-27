/**
 * Bot Runner Game Engine
 * Core game state, collision detection, and scoring
 */

import { 
  Position, 
  TileType, 
  generateMaze, 
  countTotalTasks, 
  isValidPosition,
  wrapPosition,
  SPAWN_POSITIONS
} from './bot-runner-maze';
import { 
  BugPersonality, 
  BugMode, 
  getBugNextMove, 
  getBugMode,
  getBugSpeedMultiplier 
} from './bot-runner-ai';

export enum GameState {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerState {
  position: Position;
  targetPosition: Position;
  visualPosition: { x: number; y: number }; // For smooth rendering
  direction: Position;
  nextDirection: Position | null;
  lives: number;
  invincible: boolean; // Brief invincibility after losing life
  speed: number; // Movement speed (tiles per second)
}

export interface BugState {
  position: Position;
  targetPosition: Position;
  visualPosition: { x: number; y: number }; // For smooth rendering
  personality: BugPersonality;
  mode: BugMode;
  direction: Position;
  previousDirection: Position; // Track last direction to prevent backtracking
  moveTimer: number; // Time until next move
  speed: number; // Movement speed
}

export interface GameData {
  state: GameState;
  maze: TileType[][];
  player: PlayerState;
  bugs: BugState[];
  score: number;
  tasksCollected: number;
  totalTasks: number;
  bugsDebugged: number;
  powerUpActive: boolean;
  powerUpTimeRemaining: number;
  timeElapsed: number;
  timeLimit: number;
}

const POWER_UP_DURATION = 7000; // 7 seconds
const TIME_LIMIT = 120000; // 2 minutes
const INVINCIBILITY_DURATION = 2000; // 2 seconds after losing life
const PLAYER_SPEED = 6; // Tiles per second
const BUG_BASE_SPEED = 4; // Tiles per second

/**
 * Initialize new game
 */
export function initializeGame(): GameData {
  const maze = generateMaze();
  const totalTasks = countTotalTasks();
  
  const playerStart = { ...SPAWN_POSITIONS.player };
  
  return {
    state: GameState.READY,
    maze,
    player: {
      position: { ...playerStart },
      targetPosition: { ...playerStart },
      visualPosition: { x: playerStart.x, y: playerStart.y },
      direction: { x: 0, y: 0 },
      nextDirection: null,
      lives: 3,
      invincible: false,
      speed: PLAYER_SPEED,
    },
    bugs: SPAWN_POSITIONS.bugs.map(spawn => ({
      position: { x: spawn.x, y: spawn.y },
      targetPosition: { x: spawn.x, y: spawn.y },
      visualPosition: { x: spawn.x, y: spawn.y },
      personality: spawn.personality as BugPersonality,
      mode: 'scatter' as BugMode,
      direction: { x: 0, y: -1 },
      previousDirection: { x: 0, y: -1 },
      moveTimer: 0,
      speed: BUG_BASE_SPEED,
    })),
    score: 0,
    tasksCollected: 0,
    totalTasks,
    bugsDebugged: 0,
    powerUpActive: false,
    powerUpTimeRemaining: 0,
    timeElapsed: 0,
    timeLimit: TIME_LIMIT,
  };
}

/**
 * Queue player direction (for input buffering)
 */
export function queuePlayerDirection(game: GameData, direction: Position): GameData {
  // If player is at tile center, try to move immediately
  if (game.player.position.x === game.player.targetPosition.x &&
      game.player.position.y === game.player.targetPosition.y) {
    const newPos = {
      x: game.player.position.x + direction.x,
      y: game.player.position.y + direction.y,
    };
    
    if (isValidPosition(newPos.x, newPos.y)) {
      const wrappedPos = wrapPosition(newPos);
      return {
        ...game,
        player: {
          ...game.player,
          targetPosition: wrappedPos,
          direction,
          nextDirection: null,
        },
      };
    }
  }
  
  // Otherwise, queue the direction
  return {
    ...game,
    player: {
      ...game.player,
      nextDirection: direction,
    },
  };
}

/**
 * Update player smooth movement
 */
export function updatePlayerMovement(game: GameData, deltaTime: number): GameData {
  const player = game.player;
  const moveSpeed = player.speed * (deltaTime / 1000); // tiles per frame
  
  // Check if we've reached target
  if (player.position.x === player.targetPosition.x &&
      player.position.y === player.targetPosition.y) {
    
    // Try to use queued direction
    if (player.nextDirection) {
      const newPos = {
        x: player.position.x + player.nextDirection.x,
        y: player.position.y + player.nextDirection.y,
      };
      
      if (isValidPosition(newPos.x, newPos.y)) {
        const wrappedPos = wrapPosition(newPos);
        return {
          ...game,
          player: {
            ...game.player,
            targetPosition: wrappedPos,
            direction: player.nextDirection,
            nextDirection: null,
          },
        };
      }
    }
    
    // Continue in current direction if no queue
    if (player.direction.x !== 0 || player.direction.y !== 0) {
      const newPos = {
        x: player.position.x + player.direction.x,
        y: player.position.y + player.direction.y,
      };
      
      if (isValidPosition(newPos.x, newPos.y)) {
        const wrappedPos = wrapPosition(newPos);
        return {
          ...game,
          player: {
            ...game.player,
            targetPosition: wrappedPos,
          },
        };
      }
    }
  }
  
  // Interpolate towards target
  let newVisualX = player.visualPosition.x;
  let newVisualY = player.visualPosition.y;
  
  const dx = player.targetPosition.x - player.visualPosition.x;
  const dy = player.targetPosition.y - player.visualPosition.y;
  
  if (Math.abs(dx) > 0.01) {
    newVisualX += Math.sign(dx) * Math.min(moveSpeed, Math.abs(dx));
  }
  
  if (Math.abs(dy) > 0.01) {
    newVisualY += Math.sign(dy) * Math.min(moveSpeed, Math.abs(dy));
  }
  
  // Snap to grid when close enough
  if (Math.abs(player.targetPosition.x - newVisualX) < 0.05) {
    newVisualX = player.targetPosition.x;
  }
  if (Math.abs(player.targetPosition.y - newVisualY) < 0.05) {
    newVisualY = player.targetPosition.y;
  }
  
  // Update logical position when visual reaches target
  let newPosition = player.position;
  if (Math.abs(newVisualX - player.targetPosition.x) < 0.01 &&
      Math.abs(newVisualY - player.targetPosition.y) < 0.01) {
    newPosition = { ...player.targetPosition };
  }
  
  return {
    ...game,
    player: {
      ...game.player,
      position: newPosition,
      visualPosition: { x: newVisualX, y: newVisualY },
    },
  };
}

/**
 * Check and handle tile collision
 */
export function handleTileCollision(game: GameData): GameData {
  const { x, y } = game.player.position;
  const tile = game.maze[y][x];
  
  let updatedGame = { ...game };
  
  if (tile === TileType.TASK) {
    // Collect task
    updatedGame.maze[y][x] = TileType.EMPTY;
    updatedGame.tasksCollected += 1;
    updatedGame.score += 10;
  } else if (tile === TileType.POWER_UP) {
    // Activate power-up
    updatedGame.maze[y][x] = TileType.EMPTY;
    updatedGame.powerUpActive = true;
    updatedGame.powerUpTimeRemaining = POWER_UP_DURATION;
    updatedGame.score += 50;
  }
  
  return updatedGame;
}

/**
 * Check bug collisions
 */
export function handleBugCollisions(game: GameData): GameData {
  if (game.player.invincible) {
    return game;
  }
  
  let updatedGame = { ...game };
  
  for (let i = 0; i < game.bugs.length; i++) {
    const bug = game.bugs[i];
    
    // Use proximity-based collision detection for smooth movement
    const dx = Math.abs(bug.visualPosition.x - game.player.visualPosition.x);
    const dy = Math.abs(bug.visualPosition.y - game.player.visualPosition.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if player and bug are within collision distance (0.5 tiles)
    if (distance < 0.5) {
      
      if (game.powerUpActive) {
        // Debug the bug!
        updatedGame.bugsDebugged += 1;
        updatedGame.score += 200;
        
        // Respawn bug at starting position
        const spawnIndex = i;
        const spawnPos = SPAWN_POSITIONS.bugs[spawnIndex];
        updatedGame.bugs[i] = {
          ...bug,
          position: { x: spawnPos.x, y: spawnPos.y },
          targetPosition: { x: spawnPos.x, y: spawnPos.y },
          visualPosition: { x: spawnPos.x, y: spawnPos.y },
          direction: { x: 0, y: -1 },
          previousDirection: { x: 0, y: -1 },
          mode: 'scatter',
        };
      } else {
        // Lose a life
        updatedGame.player.lives -= 1;
        updatedGame.player.invincible = true;
        
        // Respawn player
        updatedGame.player.position = { ...SPAWN_POSITIONS.player };
        updatedGame.player.direction = { x: 0, y: 0 };
        
        // Check game over
        if (updatedGame.player.lives === 0) {
          updatedGame.state = GameState.GAME_OVER;
        }
        
        // Set timer to remove invincibility
        setTimeout(() => {
          updatedGame.player.invincible = false;
        }, INVINCIBILITY_DURATION);
      }
    }
  }
  
  return updatedGame;
}

/**
 * Update bugs with smooth movement and direction persistence
 */
export function updateBugsMovement(game: GameData, deltaTime: number): GameData {
  const speedMultiplier = getBugSpeedMultiplier(game.tasksCollected);
  const mode = getBugMode(game.timeElapsed, game.powerUpActive);
  
  const updatedBugs = game.bugs.map(bug => {
    const adjustedSpeed = bug.speed * speedMultiplier * (deltaTime / 1000);
    let updatedBug = { ...bug, mode };
    
    // Only recalculate path when bug reaches its target tile
    if (Math.abs(bug.visualPosition.x - bug.targetPosition.x) < 0.01 &&
        Math.abs(bug.visualPosition.y - bug.targetPosition.y) < 0.01) {
      
      updatedBug.position = { ...bug.targetPosition };
      
      // Calculate next move (only at intersections)
      const nextPos = getBugNextMove(
        bug.position,
        game.player.position,
        game.player.direction,
        bug.personality,
        mode,
        bug.previousDirection
      );
      
      const newDirection = {
        x: nextPos.x - bug.position.x,
        y: nextPos.y - bug.position.y,
      };
      
      updatedBug.targetPosition = nextPos;
      updatedBug.previousDirection = bug.direction; // Store current as previous
      updatedBug.direction = newDirection;
    }
    
    // Smooth interpolation towards target
    let newVisualX = bug.visualPosition.x;
    let newVisualY = bug.visualPosition.y;
    
    const dx = updatedBug.targetPosition.x - bug.visualPosition.x;
    const dy = updatedBug.targetPosition.y - bug.visualPosition.y;
    
    if (Math.abs(dx) > 0.01) {
      newVisualX += Math.sign(dx) * Math.min(adjustedSpeed, Math.abs(dx));
    }
    
    if (Math.abs(dy) > 0.01) {
      newVisualY += Math.sign(dy) * Math.min(adjustedSpeed, Math.abs(dy));
    }
    
    updatedBug.visualPosition = { x: newVisualX, y: newVisualY };
    
    return updatedBug;
  });
  
  return {
    ...game,
    bugs: updatedBugs,
  };
}

/**
 * Update power-up timer
 */
export function updatePowerUp(game: GameData, deltaTime: number): GameData {
  if (!game.powerUpActive) {
    return game;
  }
  
  const newTimeRemaining = game.powerUpTimeRemaining - deltaTime;
  
  if (newTimeRemaining <= 0) {
    return {
      ...game,
      powerUpActive: false,
      powerUpTimeRemaining: 0,
    };
  }
  
  return {
    ...game,
    powerUpTimeRemaining: newTimeRemaining,
  };
}

/**
 * Update game timer
 */
export function updateTimer(game: GameData, deltaTime: number): GameData {
  const newTimeElapsed = game.timeElapsed + deltaTime;
  
  // Check time limit
  if (newTimeElapsed >= game.timeLimit) {
    return {
      ...game,
      timeElapsed: game.timeLimit,
      state: GameState.GAME_OVER,
    };
  }
  
  return {
    ...game,
    timeElapsed: newTimeElapsed,
  };
}

/**
 * Check win condition
 */
export function checkWinCondition(game: GameData): GameData {
  if (game.tasksCollected === game.totalTasks) {
    // All tasks collected! Add completion bonus
    const timeRemaining = Math.floor((game.timeLimit - game.timeElapsed) / 1000);
    const completionBonus = 1000;
    const timeBonus = timeRemaining;
    const perfectBonus = game.player.lives === 3 ? 5000 : 0;
    
    return {
      ...game,
      score: game.score + completionBonus + timeBonus + perfectBonus,
      state: GameState.GAME_OVER,
    };
  }
  
  return game;
}

/**
 * Calculate final score
 */
export function calculateFinalScore(game: GameData): number {
  let score = game.score;
  
  // Time remaining bonus (if not timed out)
  if (game.timeElapsed < game.timeLimit) {
    const timeRemaining = Math.floor((game.timeLimit - game.timeElapsed) / 1000);
    score += timeRemaining;
  }
  
  return score;
}

/**
 * Get performance rating
 */
export function getPerformanceRating(game: GameData): string {
  const completionRate = game.tasksCollected / game.totalTasks;
  const livesRemaining = game.player.lives;
  
  if (completionRate === 1 && livesRemaining === 3) {
    return 'Perfect!';
  } else if (completionRate === 1) {
    return 'Excellent!';
  } else if (completionRate >= 0.75) {
    return 'Great!';
  } else if (completionRate >= 0.5) {
    return 'Good!';
  } else {
    return 'Try Again!';
  }
}

