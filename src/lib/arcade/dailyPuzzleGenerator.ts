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
    key: 'confetti-cannon',
    name: 'Confetti Cannon Crew',
    baseReward: 32,
    baseTime: 4,
    risk: 'medium' as const,
    description:
      'Launch a glitter burst that dazzles enemy sensors and entertains your bot squad.',
  },
  {
    key: 'snack-delivery',
    name: 'Turbo Snack Delivery',
    baseReward: 24,
    baseTime: 3,
    risk: 'low' as const,
    description:
      'Zoom energy gummies to your bots for a mini sugar rush and morale boost.',
  },
  {
    key: 'dance-off',
    name: 'Dance-Off Diversion',
    baseReward: 40,
    baseTime: 5,
    risk: 'high' as const,
    description:
      'Challenge rival bots to an epic dance battle. Huge crowd control if you nail the finale.',
  },
  {
    key: 'meme-blast',
    name: 'Meme Blast Broadcast',
    baseReward: 18,
    baseTime: 2,
    risk: 'low' as const,
    description:
      'Hack the loudspeakers with viral memes that distract foes while your team recharges.',
  },
  {
    key: 'balloon-barrier',
    name: 'Inflatable Balloon Barrier',
    baseReward: 28,
    baseTime: 3,
    risk: 'medium' as const,
    description:
      'Deploy neon balloons that slow enemies and make the battlefield look party-ready.',
  },
  {
    key: 'laser-parade',
    name: 'Laser Parade Float',
    baseReward: 36,
    baseTime: 4,
    risk: 'high' as const,
    description:
      'Roll out a laser-light parade float that stuns foes with synchronized sparkle beams.',
  },
  {
    key: 'karaoke-kickoff',
    name: 'Karaoke Kick-Off',
    baseReward: 21,
    baseTime: 2,
    risk: 'medium' as const,
    description:
      'Throw a karaoke party that powers up friendly bots with feel-good vibes.',
  },
  {
    key: 'glow-up',
    name: 'Glow-Up Repair Spa',
    baseReward: 26,
    baseTime: 3,
    risk: 'low' as const,
    description:
      'Pamper tired bots with neon polish and quick repairs—stylish and efficient.',
  },
  {
    key: 'bubble-shield',
    name: 'Bubble Shield Generator',
    baseReward: 30,
    baseTime: 4,
    risk: 'medium' as const,
    description:
      'Wrap allies in rainbow bubbles that absorb hits and look fabulous doing it.',
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
    title: 'Bot Bash Planner',
    narrative:
      'The arcade plaza is hosting a pop-up bot festival! You’re in charge of crafting the most hype mini-party schedule before the crowd arrives.',
    goal: 'Pick the silliest combo of activities to earn maximum hype without running out of sparkle minutes.',
    timeBudget,
    tasks,
  };

  const solution = computeOptimalSets(config);

  return { config, solution };
}


