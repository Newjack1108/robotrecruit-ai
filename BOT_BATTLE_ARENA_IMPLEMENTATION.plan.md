# Bot Battle Arena - Quick Reaction Game Implementation Plan

## Overview

A fast-paced Whack-a-Mole style arcade game where players must click the correct bot avatar before it disappears. Features progressive difficulty, streak bonuses, and competitive scoring.

## Game Mechanics

### Core Gameplay
- 3x3 grid (9 cells total)
- Target bot shown prominently at top of screen
- Random bots spawn in grid cells for 1.5-2 seconds
- Player must click the TARGET bot only
- Wrong clicks = -50 points penalty
- 5 rounds per game session
- Progressive difficulty: Round 1 (15s) → Round 5 (10s)

### Round Progression
```typescript
Round 1: 15 seconds, 1-2 bots spawn, target changes every 4 hits
Round 2: 14 seconds, 1-2 bots spawn, target changes every 4 hits
Round 3: 13 seconds, 1-3 bots spawn, target changes every 3 hits
Round 4: 12 seconds, 1-3 bots spawn, target changes every 3 hits
Round 5: 10 seconds, 2-3 bots spawn, target changes every 3 hits
```

### Scoring System
```typescript
// Per click
correctClick = +100 points
+ speedBonus (0-50 based on reaction time < 0.5s)
+ streakMultiplier (3+ correct in row = 1.5x)

wrongClick = -50 points

// Per round
perfectRound (no mistakes) = +300 bonus
roundComplete = sum of all clicks in round

// Final score
totalScore = sum of all 5 rounds
```

## Database Schema

**Reuse existing `GameScore` model** - no schema changes needed!

```typescript
// New game type: "bot_battle_arena"
{
  gameType: "bot_battle_arena",
  score: finalScore,
  moves: totalClicks,
  timeSeconds: totalGameTime,
  metadata: {
    correctHits: number,
    wrongHits: number,
    perfectRounds: number,
    maxStreak: number,
    roundScores: [r1, r2, r3, r4, r5]
  }
}
```

## File Structure

### New Files to Create

#### Pages
1. `src/app/(dashboard)/arcade/bot-battle/page.tsx` - Game page

#### Components
1. `src/components/arcade/BotBattleGame.tsx` - Main game component
2. `src/components/arcade/BotCell.tsx` - Individual grid cell with spawn animations
3. `src/components/arcade/TargetDisplay.tsx` - Shows current target bot
4. `src/components/arcade/RoundTransition.tsx` - "Round 2!" overlay animation

#### Utils
1. `src/lib/arcade-utils.ts` - **UPDATE** to add Bot Battle logic

### Files to Modify

1. `src/app/(dashboard)/arcade/page.tsx` - Add Bot Battle game card
2. `src/lib/achievements.ts` - Add Bot Battle achievements
3. `src/lib/achievement-checker.ts` - Add Bot Battle stats tracking

## Implementation Details

### Component Architecture

#### `BotBattleGame.tsx` (Main Component)

```typescript
interface GameState {
  round: number; // 1-5
  roundTime: number; // Countdown timer
  score: number;
  totalClicks: number;
  correctHits: number;
  wrongHits: number;
  currentStreak: number;
  maxStreak: number;
  targetBot: Bot;
  activeBots: Map<cellIndex, Bot>; // Which bots are visible
  roundScores: number[];
  gameStatus: 'waiting' | 'playing' | 'roundEnd' | 'gameOver';
}

// Game flow
1. Show "Ready? Round 1" overlay (2s)
2. Start spawning bots randomly
3. Track clicks and update score in real-time
4. Round ends when timer hits 0
5. Show round summary (3s)
6. Next round or game over
```

#### `BotCell.tsx` (Grid Cell)

```typescript
interface BotCellProps {
  bot: Bot | null;
  isTarget: boolean;
  onClick: (isCorrect: boolean) => void;
}

// Features
- Empty state: dark gradient bg
- Bot spawns: scale-up + glow animation (0.2s)
- Bot despawns: fade-out (0.2s)
- Correct click: green flash + particle burst
- Wrong click: red shake + screen shake effect
```

#### `TargetDisplay.tsx`

```typescript
// Large prominent display
- Bot avatar (96x96px)
- Bot name in neon text
- Pulsing glow effect
- Changes with smooth crossfade (0.3s)
```

### Bot Selection

Use same 6 bots from Bot Memory Match:
- Boss Bot
- Bee Bot
- Chef Bot
- DIY Bot
- Scout Bot
- Garden Bot

### Spawn Logic

```typescript
function spawnBots(round: number, currentBots: Map) {
  const config = ROUND_CONFIGS[round];
  const cellsToSpawn = random(config.minBots, config.maxBots);
  
  // Always spawn target bot 40% of the time
  const shouldSpawnTarget = Math.random() < 0.4;
  
  const availableCells = [0,1,2,3,4,5,6,7,8].filter(i => !currentBots.has(i));
  const selectedCells = shuffle(availableCells).slice(0, cellsToSpawn);
  
  selectedCells.forEach((cell, idx) => {
    const bot = (shouldSpawnTarget && idx === 0) 
      ? targetBot 
      : randomBotExcept(targetBot);
    currentBots.set(cell, bot);
    
    // Auto-despawn after 1.5-2s
    setTimeout(() => despawnBot(cell), 1500 + Math.random() * 500);
  });
}
```

### Scoring Calculation

```typescript
function calculateClickScore(
  isCorrect: boolean, 
  reactionTimeMs: number, 
  currentStreak: number
): number {
  if (!isCorrect) return -50;
  
  let score = 100;
  
  // Speed bonus (faster clicks = more points)
  if (reactionTimeMs < 500) {
    score += Math.floor((500 - reactionTimeMs) / 10); // 0-50 bonus
  }
  
  // Streak multiplier
  if (currentStreak >= 3) {
    score = Math.floor(score * 1.5);
  }
  
  return score;
}

function checkPerfectRound(correctHits: number, wrongHits: number): number {
  return wrongHits === 0 && correctHits > 0 ? 300 : 0;
}
```

### API Integration

**Reuse existing `/api/arcade/scores` route** - already supports any game type!

```typescript
// On game complete
POST /api/arcade/scores
{
  gameType: "bot_battle_arena",
  score: finalScore,
  moves: totalClicks,
  timeSeconds: totalGameDuration,
  metadata: {
    correctHits,
    wrongHits,
    perfectRounds,
    maxStreak,
    roundScores: [100, 150, 200, 250, 300]
  }
}
```

### Arcade Landing Page Updates

Update `src/app/(dashboard)/arcade/page.tsx`:

```tsx
// Add second game card
<div className="grid md:grid-cols-2 gap-6">
  {/* Bot Memory Match */}
  <GameCard 
    title="Bot Memory Match"
    icon="🧠"
    href="/arcade/bot-memory"
  />
  
  {/* NEW: Bot Battle Arena */}
  <GameCard 
    title="Bot Battle Arena"
    icon="⚡"
    description="Click the target bot before time runs out!"
    href="/arcade/bot-battle"
  />
</div>

// Leaderboard with game type tabs
<Leaderboard 
  games={['bot_memory_match', 'bot_battle_arena']}
  defaultGame="bot_memory_match"
/>
```

### Achievement Integration

Add to `src/lib/achievements.ts`:

```typescript
// New achievements
{
  key: 'quick_reflexes',
  name: 'Lightning Reflexes',
  description: 'Score 1000+ in Bot Battle Arena',
  icon: '⚡',
  category: 'arcade',
  tier: 2,
  points: 40,
  requirement: { botBattleHighScore: 1000 },
},
{
  key: 'perfect_rounds',
  name: 'Flawless Victory',
  description: 'Complete all 5 rounds without a single mistake',
  icon: '💯',
  category: 'arcade',
  tier: 3,
  points: 100,
  requirement: { botBattlePerfectGame: true },
},
{
  key: 'streak_master',
  name: 'Streak Master',
  description: 'Achieve a 10+ hit streak in Bot Battle',
  icon: '🔥',
  category: 'arcade',
  tier: 2,
  points: 50,
  requirement: { botBattleMaxStreak: 10 },
},
```

Update `src/lib/achievement-checker.ts` to track these stats.

### Animations & Effects

#### Bot Spawn
```css
@keyframes botSpawn {
  from { 
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

#### Correct Click
- Green flash overlay (0.1s)
- +100 popup number with upward float
- Particle burst (5-8 particles radiating out)
- Bot celebrate animation (bounce)

#### Wrong Click
- Red shake (0.2s)
- Screen shake effect
- -50 popup number
- Sound effect (if audio enabled)

#### Round Transition
```tsx
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
  <div className="text-6xl font-bold text-cyan-400 animate-bounce">
    Round {nextRound}!
  </div>
</div>
```

### Mobile Optimizations

- Touch targets min 80x80px
- Prevent double-tap zoom
- Haptic feedback on clicks (if supported)
- Simplified animations for performance
- Portrait/landscape responsive grid

### Performance Considerations

- Use `useCallback` for click handlers
- Memoize bot spawn logic
- Debounce rapid clicks (prevent spam)
- Cancel timers on unmount
- Optimize re-renders with `React.memo`

## Implementation Steps

1. **Update arcade utilities** (`src/lib/arcade-utils.ts`)
   - Add Bot Battle constants (round configs, spawn timings)
   - Add Bot Battle scoring function
   - Add bot selection/shuffle helpers

2. **Create BotCell component** (`src/components/arcade/BotCell.tsx`)
   - Empty/spawned/clicked states
   - Animations (spawn, despawn, correct, wrong)
   - Touch-friendly click handling

3. **Create TargetDisplay component** (`src/components/arcade/TargetDisplay.tsx`)
   - Large bot display
   - Smooth transitions
   - Pulsing glow effect

4. **Create RoundTransition component** (`src/components/arcade/RoundTransition.tsx`)
   - "Round X!" overlay
   - Fade in/out animation
   - Auto-dismiss

5. **Build BotBattleGame component** (`src/components/arcade/BotBattleGame.tsx`)
   - Game state management
   - Round timer logic
   - Bot spawn/despawn system
   - Click handling and scoring
   - Round transitions
   - Game over screen

6. **Create game page** (`src/app/(dashboard)/arcade/bot-battle/page.tsx`)
   - Layout and header
   - BotBattleGame integration
   - Score submission handler

7. **Update arcade landing** (`src/app/(dashboard)/arcade/page.tsx`)
   - Add Bot Battle game card
   - Update leaderboard to support multiple games
   - Show personal bests for both games

8. **Add achievements** (`src/lib/achievements.ts`)
   - Add 3 new Bot Battle achievements
   - Update category definitions

9. **Update achievement checker** (`src/lib/achievement-checker.ts`)
   - Add Bot Battle stats calculation
   - Track high scores, perfect games, max streaks

10. **Testing & Polish**
    - Test on mobile devices
    - Verify scoring calculations
    - Check leaderboard integration
    - Test achievement unlocks
    - Performance optimization

## Visual Design

### Color Scheme
- Primary: Cyan/Blue gradients (consistent with dashboard)
- Correct: Green (#10b981)
- Wrong: Red (#ef4444)
- Neutral: Gray (#6b7280)
- Target highlight: Pulsing cyan glow

### Typography
- Game title: `font-orbitron text-4xl`
- Score: `font-bold text-3xl`
- Timer: `text-2xl tabular-nums`
- Bot names: `font-medium text-lg`

### Grid Layout
```
┌─────────────────────────┐
│   🎯 Target: Boss Bot   │  ← Target Display
├───────┬───────┬─────────┤
│  [1]  │  [2]  │   [3]   │
├───────┼───────┼─────────┤  ← 3x3 Grid
│  [4]  │  [5]  │   [6]   │
├───────┼───────┼─────────┤
│  [7]  │  [8]  │   [9]   │
└───────┴───────┴─────────┘
Round: 3/5  Time: 12s  Score: 850
```

## Success Criteria

- [ ] Game is playable and fun
- [ ] Scoring system works correctly
- [ ] Rounds progress smoothly
- [ ] Animations are smooth (60fps)
- [ ] Mobile responsive and touch-friendly
- [ ] Scores save to leaderboard
- [ ] Achievements unlock correctly
- [ ] No performance issues on average devices

## Future Enhancements (Post-MVP)

- Power-ups (freeze time, double points)
- Difficulty modes (easy/normal/hard)
- Multiplayer battles
- Daily challenges specific to Bot Battle
- Sound effects and background music
- More bot varieties (unlock with achievements)

