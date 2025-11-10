'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Timer, Target, Zap, Sparkles } from 'lucide-react';

type PuzzleTask = {
  id: string;
  name: string;
  description: string;
  reward: number;
  timeCost: number;
  risk: 'low' | 'medium' | 'high';
};

type PuzzleData = {
  puzzle: {
    id: string;
    date: string;
    config: {
      title: string;
      narrative: string;
      goal: string;
      timeBudget: number;
      tasks: PuzzleTask[];
    };
    optimalReward: number;
  };
  submission: {
    score: number;
    moves: number | null;
    durationSeconds: number | null;
    isCorrect: boolean;
    submittedAnswer: {
      selectedTaskIds: string[];
      totalTime: number;
      totalReward: number;
      efficiency: number;
    };
    completedAt: string;
    rewards?: SubmissionResult['rewards'];
    challenge?: SubmissionResult['challenge'];
  } | null;
};

type SubmissionResult = {
  score: number;
  moves: number | null;
  durationSeconds: number | null;
  isCorrect: boolean;
  efficiency: number;
  totalReward: number;
  totalTime: number;
  optimalReward: number;
  selectedTaskIds: string[];
  completedAt: string;
  rewards?: {
    pointsAwarded: number;
    powerUpCreditsAwarded: number;
    streak?: {
      updated: boolean;
      currentStreak: number;
      longestStreak: number;
      milestoneReached: number | null;
      milestoneBonus: number;
      totalCheckIns: number;
    };
  } | null;
  challenge?: {
    title: string;
    pointsEarned: number;
  } | null;
};

export function DailyPuzzleGame() {
  const [data, setData] = useState<PuzzleData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'completed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const timeBudget = data?.puzzle.config.timeBudget ?? 0;

  useEffect(() => {
    let isMounted = true;

    async function loadPuzzle() {
      try {
        const response = await fetch('/api/arcade/daily-puzzle');

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const json = (await response.json()) as PuzzleData;

        if (!isMounted) return;

        setData(json);

        if (json.submission) {
          setResult({
            score: json.submission.score,
            moves: json.submission.moves,
            durationSeconds: json.submission.durationSeconds,
            isCorrect: json.submission.isCorrect,
            efficiency: json.submission.submittedAnswer.efficiency,
            totalReward: json.submission.submittedAnswer.totalReward,
            totalTime: json.submission.submittedAnswer.totalTime,
            optimalReward: json.puzzle.optimalReward,
            selectedTaskIds: json.submission.submittedAnswer.selectedTaskIds,
            completedAt: json.submission.completedAt,
            rewards: json.submission.rewards ?? null,
            challenge: json.submission.challenge ?? null,
          });
          setSelectedIds(json.submission.submittedAnswer.selectedTaskIds);
          setSubmitState('completed');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load today’s puzzle. Please try again in a moment.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPuzzle();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!data || submitState === 'completed') return undefined;

    const interval = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [data, submitState]);

  const tasks = data?.puzzle.config.tasks ?? [];

  const selectedTasks = useMemo(() => {
    if (!tasks.length) return [];
    const ids = new Set(selectedIds);
    return tasks.filter((task) => ids.has(task.id));
  }, [tasks, selectedIds]);

  const totalTime = selectedTasks.reduce((acc, task) => acc + task.timeCost, 0);
  const totalReward = selectedTasks.reduce((acc, task) => acc + task.reward, 0);
  const optimalReward = data?.puzzle.optimalReward ?? 0;
  const efficiency = optimalReward > 0 ? Math.min(100, Math.round((totalReward / optimalReward) * 100)) : 0;

  const toggleTask = useCallback(
    (taskId: string) => {
      if (submitState === 'completed') return;

      setSelectedIds((prev) => {
        if (prev.includes(taskId)) {
          return prev.filter((id) => id !== taskId);
        }
        return [...prev, taskId];
      });
    },
    [submitState],
  );

  const handleSubmit = useCallback(async () => {
    if (!data) return;
    if (!selectedIds.length) {
      setError('Select at least one action before submitting.');
      return;
    }

    if (totalTime > timeBudget) {
      setError('Command time budget exceeded. Remove an action before submitting.');
      return;
    }

    setError(null);
    setSubmitState('submitting');

    try {
      const response = await fetch('/api/arcade/daily-puzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puzzleId: data.puzzle.id,
          selectedTaskIds: selectedIds,
          durationSeconds: secondsElapsed,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to submit puzzle response.');
      }

      const json = (await response.json()) as { submission: SubmissionResult };
      setResult(json.submission);
      setSubmitState('completed');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to submit response.');
      setSubmitState('idle');
    }
  }, [data, selectedIds, secondsElapsed, timeBudget, totalTime]);

  const resetSelection = useCallback(() => {
    if (submitState === 'completed') return;
    setSelectedIds([]);
  }, [submitState]);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/60 border-cyan-500/30 p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
        <Loader2 className="w-8 h-8 text-cyan-300 animate-spin mb-3" />
        <p className="text-sm text-gray-400">Synchronising today’s tactical puzzle…</p>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="bg-gray-900/60 border-red-500/30 p-6 text-center min-h-[240px]">
        <p className="text-sm text-red-300">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { puzzle } = data;
  const hasCompleted = submitState === 'completed';

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/70 border-cyan-500/30 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <Shield className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide">{puzzle.config.title}</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">{puzzle.config.goal}</h2>
            <p className="text-sm text-gray-300 max-w-3xl">{puzzle.config.narrative}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Command Budget</p>
              <p className="text-lg font-semibold text-white">{timeBudget}</p>
            </div>
            <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Current Plan</p>
              <p className={`text-lg font-semibold ${totalTime > timeBudget ? 'text-red-400' : 'text-white'}`}>{totalTime}</p>
            </div>
            <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Projected Control</p>
              <p className="text-lg font-semibold text-emerald-300">{totalReward}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-2"><Timer className="w-4 h-4" /> Time Allocation</span>
            <span>
              {totalTime}/{timeBudget} units used
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all"
              style={{ width: `${Math.min(100, timeBudget ? (totalTime / timeBudget) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={resetSelection} disabled={!selectedIds.length || hasCompleted}>
            Clear Plan
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitState !== 'idle' || !selectedIds.length}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {submitState === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Locking In…
              </>
            ) : (
              'Execute Plan'
            )}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => {
          const isSelected = selectedIds.includes(task.id);
          const disabled = hasCompleted;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              disabled={disabled}
              className={`text-left transition-transform ${
                disabled ? 'cursor-not-allowed opacity-80' : 'hover:-translate-y-0.5'
              }`}
            >
              <Card
                className={`h-full bg-gray-900/60 border ${
                  isSelected ? 'border-cyan-400/70 shadow-lg shadow-cyan-500/20' : 'border-gray-800'
                } p-5 space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{task.description}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      task.risk === 'high'
                        ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                        : task.risk === 'medium'
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                        : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    }
                  >
                    {task.risk.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-cyan-200">
                    <Target className="w-4 h-4" />
                    +{task.reward} influence
                  </span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <Timer className="w-4 h-4" />
                    {task.timeCost} time
                  </span>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {result && (
        <Card className="bg-gray-900/70 border-emerald-500/30 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-300" />
                Decision Locked
              </h3>
              <p className="text-sm text-gray-300">
                {result.isCorrect
                  ? 'Perfect execution! You matched the optimal tactical outcome.'
                  : `Solid move. You achieved ${result.efficiency}% of the optimal influence.`}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-200">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400">Total Influence</p>
                <p className="text-lg font-semibold text-white">{result.totalReward}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400">Optimal</p>
                <p className="text-lg font-semibold text-emerald-300">{result.optimalReward}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400">Time Used</p>
                <p className="text-lg font-semibold text-white">{result.totalTime}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400">Decision Time</p>
                <p className="text-lg font-semibold text-white">
                  {result.durationSeconds ? `${result.durationSeconds}s` : `${secondsElapsed}s`}
                </p>
              </div>
            </div>
          </div>

          {result.rewards && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Points Awarded
                </p>
                <p className="text-2xl font-semibold text-white mt-1">+{result.rewards.pointsAwarded}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-cyan-200 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Power-Up Credit
                </p>
                <p className="text-2xl font-semibold text-white mt-1">+{result.rewards.powerUpCreditsAwarded}</p>
              </div>
              {result.rewards.streak && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-amber-200">Streak Status</p>
                  <p className="text-sm text-amber-100 mt-1">
                    {result.rewards.streak.updated
                      ? `Streak ${result.rewards.streak.currentStreak} days • Longest ${result.rewards.streak.longestStreak}`
                      : `Streak steady at ${result.rewards.streak.currentStreak} days`}
                  </p>
                  {result.rewards.streak.milestoneReached && (
                    <p className="text-xs text-amber-200 mt-1">
                      Milestone {result.rewards.streak.milestoneReached} unlocked (+{result.rewards.streak.milestoneBonus}pt)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {result.challenge && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200">
              <p className="font-medium text-white">Challenge Complete</p>
              <p className="text-xs text-gray-300">
                {result.challenge.title} • +{result.challenge.pointsEarned} challenge points added to your progress track.
              </p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            <p>
              Actions locked: {result.selectedTaskIds.length ? result.selectedTaskIds.length : selectedIds.length}. Come back
              tomorrow for a fresh tactical scenario.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}


