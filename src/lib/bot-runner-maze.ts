/**
 * Bot Runner Maze Generation
 * Classic Pac-Man inspired maze layout with walls, paths, tasks, and power-ups
 */

export const MAZE_WIDTH = 20;
export const MAZE_HEIGHT = 15;
export const TILE_SIZE = 32;

export enum TileType {
  WALL = 0,
  PATH = 1,
  TASK = 2,
  POWER_UP = 3,
  EMPTY = 4, // Path without task
}

export interface Position {
  x: number;
  y: number;
}

/**
 * Classic maze layout (20x15 grid)
 * 0 = Wall, 1 = Path with task, 3 = Power-up, 4 = Empty path
 */
export const MAZE_LAYOUT = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,3,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,3,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,1,0,0,0,4,4,4,4,0,0,0,1,0,0,0,0],
  [0,0,0,0,1,0,4,4,4,4,4,4,4,4,0,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,3,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,3,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

/**
 * Spawn positions for player and bugs
 */
export const SPAWN_POSITIONS = {
  player: { x: 10, y: 11 } as Position,
  bugs: [
    { x: 8, y: 7, personality: 'chaser' } as { x: number; y: number; personality: string },
    { x: 9, y: 8, personality: 'ambusher' } as { x: number; y: number; personality: string },
    { x: 10, y: 8, personality: 'random' } as { x: number; y: number; personality: string },
    { x: 11, y: 8, personality: 'patroller' } as { x: number; y: number; personality: string },
  ],
};

/**
 * Generate maze with tasks and power-ups
 */
export function generateMaze(): TileType[][] {
  const maze: TileType[][] = [];
  
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_WIDTH; x++) {
      const tileValue = MAZE_LAYOUT[y][x];
      
      if (tileValue === 0) {
        maze[y][x] = TileType.WALL;
      } else if (tileValue === 3) {
        maze[y][x] = TileType.POWER_UP;
      } else if (tileValue === 4) {
        maze[y][x] = TileType.EMPTY;
      } else {
        // Regular path with task
        maze[y][x] = TileType.TASK;
      }
    }
  }
  
  return maze;
}

/**
 * Count total tasks in maze
 */
export function countTotalTasks(): number {
  let count = 0;
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
      if (MAZE_LAYOUT[y][x] === 1) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Check if position is valid path (not wall)
 */
export function isValidPosition(x: number, y: number): boolean {
  if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
    return false;
  }
  return MAZE_LAYOUT[y][x] !== 0;
}

/**
 * Get valid neighbors for pathfinding
 */
export function getValidNeighbors(pos: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
  ];
  
  for (const dir of directions) {
    const newX = pos.x + dir.x;
    const newY = pos.y + dir.y;
    
    if (isValidPosition(newX, newY)) {
      neighbors.push({ x: newX, y: newY });
    }
  }
  
  return neighbors;
}

/**
 * Handle tunnel wrap-around
 */
export function wrapPosition(pos: Position): Position {
  let { x, y } = pos;
  
  // Wrap horizontally through side tunnels
  if (y === 7 || y === 8) {
    if (x < 0) x = MAZE_WIDTH - 1;
    if (x >= MAZE_WIDTH) x = 0;
  }
  
  return { x, y };
}

