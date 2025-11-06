'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileStatsCard } from './ProfileStatsCard';
import { StreakCounter } from '@/components/streaks/StreakCounter';
import { DailyChallengeCard } from '@/components/challenges/DailyChallengeCard';
import { RemindersCard } from './RemindersCard';

interface DashboardStatsSectionProps {
  userName?: string;
  userTier: number;
}

export function DashboardStatsSection({ userName, userTier }: DashboardStatsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron font-bold text-white">Stats & Progress</h2>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Expand
            </>
          )}
        </Button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Profile & Achievements */}
          <div className="h-full">
            <ProfileStatsCard 
              userName={userName}
              userTier={userTier}
            />
          </div>

          {/* Daily Streak */}
          <div className="h-full">
            <StreakCounter variant="dashboard" />
          </div>

          {/* Daily Challenge + Reminders (stacked, same total height as streak) */}
          <div className="h-full flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <DailyChallengeCard />
            </div>
            <div className="flex-1 min-h-0">
              <RemindersCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

