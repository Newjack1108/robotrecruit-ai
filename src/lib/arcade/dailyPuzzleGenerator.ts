export type StrategyTask = {
  id: string;
  name: string;
  description: string;
  reward: number;
  timeCost: number;
  risk: 'low' | 'medium' | 'high';
};

export type DailyStrategyPuzzleConfig = {
  version: number;
  seed: string;
  dateISO: string;
  title: string;
  narrative: string;
  goal: string;
  timeBudget: number;
  tasks: StrategyTask[];
};

export type DailyStrategyPuzzleSolution = {
  optimalReward: number;
  optimalTaskSets: string[][];
};

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TASK_LIBRARY = [
  {
    key: 'fortify-outpost',
    name: 'Fortify Outpost',
    baseReward: 32,
    baseTime: 4,
    risk: 'medium' as const,
    description:
      'Reinforce the southern outpost to slow incoming rogue bots and protect the main lane.',
  },
  {
    key: 'supply-run',
    name: 'Supply Run',
    baseReward: 24,
    baseTime: 3,
    risk: 'low' as const,
    description:
      'Deliver upgraded servo kits to allied bots. Slight delay, but improves overall efficiency.',
  },
  {
    key: 'decoy-squad',
    name: 'Deploy Decoy Squad',
    baseReward: 40,
    baseTime: 5,
    risk: 'high' as const,
    description:
      'Send agile decoy bots to draw fire away from key objectives. High payoff but consumes time.',
  },
  {
    key: 'intel-scan',
    name: 'Deep Intel Scan',
    baseReward: 18,
    baseTime: 2,
    risk: 'low' as const,
    description:
      'Run predictive pathfinding to reveal the next enemy wave composition and route.',
  },
  {
    key: 'energy-grid',
    name: 'Stabilise Energy Grid',
    baseReward: 28,
    baseTime: 3,
    risk: 'medium' as const,
    description:
      'Balance the defence grid to reduce overload risk and unlock bonus utilities for allies.',
  },
  {
    key: 'precision-strike',
    name: 'Precision Strike',
    baseReward: 36,
    baseTime: 4,
    risk: 'high' as const,
    description:
      'Coordinate a focused strike on the rogue command unit. High reward if executed swiftly.',
  },
  {
    key: 'recruit-hacker',
    name: 'Recruit Hacker Bot',
    baseReward: 21,
    baseTime: 2,
    risk: 'medium' as const,
    description:
      'Pull in a specialist bot to weaken enemy shields for the next confrontation.',
  },
  {
    key: 'repair-colony',
    name: 'Repair Colony Bots',
    baseReward: 26,
    baseTime: 3,
    risk: 'low' as const,
    description:
      'Restore critical systems for civilian bots to keep morale and resources flowing.',
  },
  {
    key: 'jammer-net',
    name: 'Deploy Jammer Net',
    baseReward: 30,
    baseTime: 4,
    risk: 'medium' as const,
    description:
      'Limit enemy communications, slowing their response while your squad repositions.',
  },
];

const TIME_BUDGET_OPTIONS = [10, 11, 12, 13, 14];

function seededShuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateTasks(random: () => number) {
  const shuffled = seededShuffle(TASK_LIBRARY, random).slice(0, 6);

  return shuffled.map((template, index) => {
    const rewardMultiplier = 0.8 + random() * 0.6; // 0.8 - 1.4
    const timeVariance = Math.round((random() - 0.5) * 2); // -1, 0, 1

    const reward = Math.round(template.baseReward * rewardMultiplier);
    const timeCost = Math.max(1, template.baseTime + timeVariance);

    return {
      id: `${template.key}-${index}`,
      name: template.name,
      description: template.description,
      reward,
      timeCost,
      risk: template.risk,
    } satisfies StrategyTask;
  });
}

function toSeedNumber(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = date.getUTCDate().toString().padStart(2, '0');
  return parseInt(`${yyyy}${mm}${dd}`, 10);
}

export function computeOptimalSets(config: DailyStrategyPuzzleConfig): DailyStrategyPuzzleSolution {
  let optimalReward = 0;
  const optimalTaskSets: string[][] = [];

  const { tasks, timeBudget } = config;
  const taskCount = tasks.length;

  for (let mask = 0; mask < 1 << taskCount; mask += 1) {
    let reward = 0;
    let time = 0;
    const selected: string[] = [];

    for (let i = 0; i < taskCount; i += 1) {
      if ((mask & (1 << i)) !== 0) {
        reward += tasks[i].reward;
        time += tasks[i].timeCost;
        selected.push(tasks[i].id);
      }
    }

    if (time > timeBudget) continue;

    if (reward > optimalReward) {
      optimalReward = reward;
      optimalTaskSets.length = 0;
      optimalTaskSets.push(selected);
    } else if (reward === optimalReward) {
      optimalTaskSets.push(selected);
    }
  }

  return {
    optimalReward,
    optimalTaskSets,
  };
}

export function generateDailyStrategyPuzzle(date = new Date()) {
  const seedNumber = toSeedNumber(date);
  const random = mulberry32(seedNumber);

  const tasks = generateTasks(random);
  const timeBudget = TIME_BUDGET_OPTIONS[Math.floor(random() * TIME_BUDGET_OPTIONS.length)];

  const config: DailyStrategyPuzzleConfig = {
    version: 1,
    seed: seedNumber.toString(),
    dateISO: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString(),
    title: 'Tactical Allocation',
    narrative:
      'Rogue drones are breaching multiple lanes. You lead the defence squad and must decide how to spend your limited command bandwidth this cycle.',
    goal: 'Select the combination of actions that maximises control while staying within the command time budget.',
    timeBudget,
    tasks,
  };

  const solution = computeOptimalSets(config);

  return { config, solution };
}


