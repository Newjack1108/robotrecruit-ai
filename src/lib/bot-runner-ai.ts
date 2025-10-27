/**
 * Bot Runner AI - Bug pathfinding and behaviors
 */

import { Position, getValidNeighbors, wrapPosition } from './bot-runner-maze';

export type BugPersonality = 'chaser' | 'ambusher' | 'random' | 'patroller';
export type BugMode = 'chase' | 'scatter' | 'frightened';

/**
 * Calculate Manhattan distance between two positions
 */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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
  mode: BugMode
): Position {
  const neighbors = getValidNeighbors(bugPos);
  
  if (neighbors.length === 0) {
    return bugPos;
  }
  
  let target: Position;
  
  if (mode === 'frightened') {
    // Run away from player - pick furthest neighbor
    target = neighbors.reduce((furthest, neighbor) => {
      const dist = manhattanDistance(neighbor, playerPos);
      const furthestDist = manhattanDistance(furthest, playerPos);
      return dist > furthestDist ? neighbor : furthest;
    }, neighbors[0]);
  } else if (mode === 'scatter') {
    // Go to scatter corner
    target = getScatterTarget(personality);
  } else {
    // Chase mode - target depends on personality
    switch (personality) {
      case 'chaser':
        // Direct chaser - target player position
        target = playerPos;
        break;
        
      case 'ambusher':
        // Anticipate player movement - target 4 tiles ahead
        target = {
          x: playerPos.x + (playerDirection.x * 4),
          y: playerPos.y + (playerDirection.y * 4),
        };
        break;
        
      case 'random':
        // Random when far, chase when close
        const distance = manhattanDistance(bugPos, playerPos);
        if (distance < 8) {
          target = playerPos;
        } else {
          // Random movement
          return neighbors[Math.floor(Math.random() * neighbors.length)];
        }
        break;
        
      case 'patroller':
        // Patrol zone - if player nearby, chase
        const patrolDistance = manhattanDistance(bugPos, playerPos);
        if (patrolDistance < 5) {
          target = playerPos;
        } else {
          // Stay in patrol zone (center-right area)
          target = { x: 15, y: 7 };
        }
        break;
    }
  }
  
  // Find neighbor closest to target using greedy best-first
  const bestNeighbor = neighbors.reduce((best, neighbor) => {
    const dist = manhattanDistance(neighbor, target);
    const bestDist = manhattanDistance(best, target);
    return dist < bestDist ? neighbor : best;
  }, neighbors[0]);
  
  return wrapPosition(bestNeighbor);
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

