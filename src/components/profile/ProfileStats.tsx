'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TIER_INFO, CATEGORY_NAMES } from '@/lib/achievements';
import { Loader2, Trophy, Star, Target, MessageSquare, Users, Zap, Bot } from 'lucide-react';

interface ProfileStatsProps {
  initialData?: any;
}

export function ProfileStats({ initialData }: ProfileStatsProps) {
  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchStats();
    }
  }, [initialData]);

  async function fetchStats() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12 text-gray-400">
        Failed to load profile stats
      </div>
    );
  }

  const { stats, unlockedAchievements, allAchievements } = data;
  const unlockedIds = new Set(unlockedAchievements.map((ua: any) => ua.achievementId));

  // Group achievements by category
  const achievementsByCategory: Record<string, any[]> = {};
  allAchievements.forEach((ach: any) => {
    if (!achievementsByCategory[ach.category]) {
      achievementsByCategory[ach.category] = [];
    }
    achievementsByCategory[ach.category].push(ach);
  });

  const completionRate = allAchievements.length > 0 
    ? (unlockedAchievements.length / allAchievements.length * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-purple-900/30 border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-orbitron text-white">Your Stats</CardTitle>
              <CardDescription className="text-gray-300 mt-2">
                Total Achievement Points: <span className="text-cyan-400 font-bold text-xl">{stats.totalPoints}</span>
              </CardDescription>
            </div>
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Bot className="w-6 h-6" />} label="Bots Hired" value={stats.hiredBots} color="cyan" />
            <StatCard icon={<MessageSquare className="w-6 h-6" />} label="Conversations" value={stats.conversations} color="blue" />
            <StatCard icon={<Users className="w-6 h-6" />} label="Forum Posts" value={stats.forumPosts} color="purple" />
            <StatCard icon={<Zap className="w-6 h-6" />} label="Power-Ups Used" value={stats.powerUpUsed} color="yellow" />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress */}
      <Card className="bg-gray-900/50 border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-3">
            <Star className="w-7 h-7 text-yellow-400" />
            Achievements
          </CardTitle>
          <CardDescription className="text-gray-300">
            {unlockedAchievements.length} / {allAchievements.length} unlocked ({completionRate}%)
          </CardDescription>
          
          {/* Progress bar */}
          <div className="mt-3 bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(achievementsByCategory).map(([category, achievements]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((ach: any) => {
                  const isUnlocked = unlockedIds.has(ach.id);
                  const tierInfo = TIER_INFO[ach.tier as keyof typeof TIER_INFO];
                  
                  return (
                    <div
                      key={ach.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isUnlocked
                          ? `${tierInfo.bg} ${tierInfo.border}`
                          : 'bg-gray-800/30 border-gray-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                          {ach.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                              {ach.name}
                            </h4>
                            {isUnlocked && (
                              <Badge className={`${tierInfo.bg} ${tierInfo.color} text-xs`}>
                                {tierInfo.name}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                            {ach.description}
                          </p>
                          <p className={`text-xs mt-1 ${isUnlocked ? tierInfo.color : 'text-gray-600'}`}>
                            +{ach.points} points
                          </p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'cyan' | 'blue' | 'purple' | 'yellow';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
  };

  return (
    <div className={`${colors[color]} p-4 rounded-lg`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

