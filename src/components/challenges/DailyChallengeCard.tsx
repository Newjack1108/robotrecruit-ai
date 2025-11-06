'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Loader2, CheckCircle2, Target } from 'lucide-react';

interface ChallengeCompletion {
  progress: number;
  isCompleted: boolean;
  pointsEarned: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  requirement: {
    type: string;
    count: number;
  };
}

interface DailyChallengeCardProps {
  onChallengeComplete?: () => void;
}

export function DailyChallengeCard({ onChallengeComplete }: DailyChallengeCardProps) {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [completion, setCompletion] = useState<ChallengeCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodaysChallenge(true); // Initial load with loading state

    // Refresh every 30 seconds to check for progress updates
    const interval = setInterval(() => fetchTodaysChallenge(false), 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTodaysChallenge(showLoading = false) {
    try {
      const response = await fetch('/api/challenges/today');
      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
        setCompletion(data.completion);

        // Trigger callback if challenge was just completed
        if (data.completion?.isCompleted && !completion?.isCompleted && onChallengeComplete) {
          onChallengeComplete();
        }
      }
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 border-yellow-500/30">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  const progress = completion?.progress || 0;
  const required = challenge.requirement.count;
  const progressPercent = Math.min((progress / required) * 100, 100);
  const isComplete = completion?.isCompleted || false;

  return (
    <Card className={`daily-challenge-card relative overflow-hidden transition-all h-full flex flex-col ${
      isComplete 
        ? 'bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 border-green-500/50' 
        : 'bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 border-yellow-500/30 hover:border-yellow-400/50'
    }`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 animate-pulse"></div>

      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-4xl ${isComplete ? 'animate-bounce' : ''}`}>
              {isComplete ? '✅' : challenge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-white">{challenge.title}</CardTitle>
                {isComplete && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
              </div>
              <CardDescription className="text-gray-300">
                {challenge.description}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            {challenge.points} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex-1">
        {/* Progress Bar */}
        {!isComplete && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Target className="w-4 h-4" />
                <span>Progress: {progress}/{required}</span>
              </div>
              <span className="text-yellow-400 font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 transition-all duration-500 ease-out rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <p className="text-green-400 font-bold text-lg">
              🎉 Challenge Complete! +{completion?.pointsEarned} points earned!
            </p>
            <p className="text-green-300 text-sm mt-1">
              Come back tomorrow for a new challenge!
            </p>
          </div>
        )}
      </CardContent>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
    </Card>
  );
}

