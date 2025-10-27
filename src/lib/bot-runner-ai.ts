/**
 * Bot Runner AI - Bug pathfinding and behaviors
 */

import { Position, getValidNeighbors, wrapPosition, isValidPosition, MAZE_WIDTH, MAZE_HEIGHT } from './bot-runner-maze';

export type BugPersonality = 'chaser' | 'ambusher' | 'random' | 'patroller';
export type BugMode = 'chase' | 'scatter' | 'frightened';

/**
 * Calculate Manhattan distance between two positions
 */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Clamp position to valid maze bounds and ensure it's not a wall
 */
function getValidTargetPosition(pos: Position): Position {
  // Clamp to maze bounds
  let x = Math.max(0, Math.min(MAZE_WIDTH - 1, pos.x));
  let y = Math.max(0, Math.min(MAZE_HEIGHT - 1, pos.y));
  
  // If position is a wall, find nearest valid position
  if (!isValidPosition(x, y)) {
    // Search in expanding radius for valid position
    for (let radius = 1; radius < 5; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const testX = x + dx;
          const testY = y + dy;
          if (isValidPosition(testX, testY)) {
            return { x: testX, y: testY };
          }
        }
      }
    }
    // Fallback to center of maze
    return { x: 10, y: 7 };
  }
  
  return { x, y };
}

/**
 * Get scatter target based on bug personality
 */
function getScatterTarget(personality: BugPersonality): Position {
  switch (personality) {
    case 'chaser':
      return { x: 18, y: 1 }; // Top right
    case 'ambusher':
      return { x: 1, y: 1 }; // Top left
    case 'random':
      return { x: 18, y: 13 }; // Bottom right
    case 'patroller':
      return { x: 1, y: 13 }; // Bottom left
  }
}

/**
 * Get next move for bug based on personality and mode
 */
export function getBugNextMove(
  bugPos: Position,
  playerPos: Position,
  playerDirection: Position,
  personality: BugPersonality,
  mode: BugMode,
  previousDirection?: Position
): Position {
  let neighbors = getValidNeighbors(bugPos);
  
  if (neighbors.length === 0) {
    return bugPos;
  }
  
  // Prevent 180° turns (going backwards) unless it's the only option
  if (previousDirection && (previousDirection.x !== 0 || previousDirection.y !== 0)) {
    const reverseDir = { x: -previousDirection.x, y: -previousDirection.y };
    const filteredNeighbors = neighbors.filter(n => {
      const dir = { x: n.x - bugPos.x, y: n.y - bugPos.y };
      return !(dir.x === reverseDir.x && dir.y === reverseDir.y);
    });
    
    // Only use filtered list if we have other options
    if (filteredNeighbors.length > 0) {
      neighbors = filteredNeighbors;
    }
  }
  
  let target: Position;
  
  if (mode === 'frightened') {
    // Run away from player - just pick a random valid neighbor
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  } else if (mode === 'scatter') {
    // Go to scatter corner
    target = getValidTargetPosition(getScatterTarget(personality));
  } else {
    // Chase mode - target depends on personality
    switch (personality) {
      case 'chaser':
        // Direct chaser - target player position
        target = getValidTargetPosition(playerPos);
        break;
        
      case 'ambusher':
        // Anticipate player movement - target 4 tiles ahead
        const anticipatedPos = {
          x: playerPos.x + (playerDirection.x * 4),
          y: playerPos.y + (playerDirection.y * 4),
        };
        target = getValidTargetPosition(anticipatedPos);
        break;
        
      case 'random':
        // Random when far, chase when close
        const distance = manhattanDistance(bugPos, playerPos);
        if (distance < 8) {
          target = getValidTargetPosition(playerPos);
        } else {
          // Random movement
          return neighbors[Math.floor(Math.random() * neighbors.length)];
        }
        break;
        
      case 'patroller':
        // Patrol zone - if player nearby, chase
        const patrolDistance = manhattanDistance(bugPos, playerPos);
        if (patrolDistance < 5) {
          target = getValidTargetPosition(playerPos);
        } else {
          // Stay in patrol zone (center-right area)
          target = getValidTargetPosition({ x: 15, y: 7 });
        }
        break;
      default:
        target = getValidTargetPosition(playerPos);
    }
  }
  
  // Find neighbor closest to target using greedy best-first
  const bestNeighbor = neighbors.reduce((best, neighbor) => {
    const dist = manhattanDistance(neighbor, target);
    const bestDist = manhattanDistance(best, target);
    return dist < bestDist ? neighbor : best;
  }, neighbors[0]);
  
  // Return the best neighbor directly - it's already validated by getValidNeighbors
  return bestNeighbor;
}

/**
 * Determine bug mode based on game state
 */
export function getBugMode(
  timeElapsed: number,
  powerUpActive: boolean
): BugMode {
  if (powerUpActive) {
    return 'frightened';
  }
  
  // Alternate between chase and scatter every 20 seconds
  const cycle = Math.floor(timeElapsed / 20000);
  return cycle % 2 === 0 ? 'chase' : 'scatter';
}

/**
 * Calculate bug speed multiplier based on tasks collected
 */
export function getBugSpeedMultiplier(tasksCollected: number): number {
  // Start at 1x, increase 10% every 50 tasks
  const multiplier = 1 + (Math.floor(tasksCollected / 50) * 0.1);
  return Math.min(multiplier, 2.0); // Cap at 2x speed
}

