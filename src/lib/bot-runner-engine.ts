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
  direction: Position;
  nextDirection: Position | null;
  lives: number;
  invincible: boolean; // Brief invincibility after losing life
}

export interface BugState {
  position: Position;
  personality: BugPersonality;
  mode: BugMode;
  direction: Position;
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
const BUG_MOVE_INTERVAL = 200; // Bugs move every 200ms

/**
 * Initialize new game
 */
export function initializeGame(): GameData {
  const maze = generateMaze();
  const totalTasks = countTotalTasks();
  
  return {
    state: GameState.READY,
    maze,
    player: {
      position: { ...SPAWN_POSITIONS.player },
      direction: { x: 0, y: 0 },
      nextDirection: null,
      lives: 3,
      invincible: false,
    },
    bugs: SPAWN_POSITIONS.bugs.map(spawn => ({
      position: { x: spawn.x, y: spawn.y },
      personality: spawn.personality as BugPersonality,
      mode: 'scatter' as BugMode,
      direction: { x: 0, y: -1 },
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
 * Move player in direction
 */
export function movePlayer(game: GameData, direction: Position): GameData {
  const newPos = {
    x: game.player.position.x + direction.x,
    y: game.player.position.y + direction.y,
  };
  
  // Check if move is valid
  if (!isValidPosition(newPos.x, newPos.y)) {
    return game;
  }
  
  // Handle wrapping
  const wrappedPos = wrapPosition(newPos);
  
  // Update player
  const updatedPlayer = {
    ...game.player,
    position: wrappedPos,
    direction,
  };
  
  return {
    ...game,
    player: updatedPlayer,
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
    
    // Check if player and bug are on same tile
    if (bug.position.x === game.player.position.x && 
        bug.position.y === game.player.position.y) {
      
      if (game.powerUpActive) {
        // Debug the bug!
        updatedGame.bugsDebugged += 1;
        updatedGame.score += 200;
        
        // Respawn bug at starting position
        const spawnIndex = i;
        updatedGame.bugs[i] = {
          ...bug,
          position: { 
            x: SPAWN_POSITIONS.bugs[spawnIndex].x, 
            y: SPAWN_POSITIONS.bugs[spawnIndex].y 
          },
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
 * Move all bugs
 */
export function moveBugs(game: GameData): GameData {
  const speedMultiplier = getBugSpeedMultiplier(game.tasksCollected);
  const mode = getBugMode(game.timeElapsed, game.powerUpActive);
  
  const updatedBugs = game.bugs.map(bug => {
    const nextPos = getBugNextMove(
      bug.position,
      game.player.position,
      game.player.direction,
      bug.personality,
      mode
    );
    
    return {
      ...bug,
      position: nextPos,
      mode,
      direction: {
        x: nextPos.x - bug.position.x,
        y: nextPos.y - bug.position.y,
      },
    };
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

