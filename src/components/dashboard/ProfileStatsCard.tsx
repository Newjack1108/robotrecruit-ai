'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Loader2, ChevronRight, Gamepad2, Zap } from 'lucide-react';
import Link from 'next/link';

interface ProfileStatsCardProps {
  userName?: string;
  userTier: number;
}

export function ProfileStatsCard({ userName, userTier }: ProfileStatsCardProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats(true); // Initial load with loading state
    
    // Refresh stats when achievements are unlocked
    const handleAchievementUnlock = () => {
      console.log('[ProfileStatsCard] Achievement unlocked, refreshing stats...');
      fetchStats(false); // Refresh without loading state
    };
    
    window.addEventListener('achievementUnlocked', handleAchievementUnlock);
    
    // Also poll every 15 seconds to catch any updates
    const interval = setInterval(() => fetchStats(false), 15000);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlock);
      clearInterval(interval);
    };
  }, []);

  async function fetchStats(showLoading = false) {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const json = await response.json();
        setStats(json);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 border-yellow-500/30">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalPoints = stats.unlockedAchievements?.reduce((sum: number, ua: any) => sum + ua.achievement.points, 0) || 0;
  const achievementCount = stats.unlockedAchievements?.length || 0;
  const totalAchievements = stats.allAchievements?.length || 0;

  // Get recent achievements (last 2 for compact display)
  const recentAchievements = stats.unlockedAchievements?.slice(0, 2) || [];

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 2: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 3: return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTierBadge = (achievementTier: number) => {
    const colors = {
      1: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      2: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      3: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    };
    return colors[achievementTier as keyof typeof colors] || colors[1];
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 border-yellow-500/30 hover:border-yellow-400/50 transition-all profile-stats-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg font-orbitron">Profile & Achievements</CardTitle>
              <p className="text-gray-400 text-xs">Your progress and accolades</p>
            </div>
          </div>
          <Link href="/profile">
            <Button 
              size="sm"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-yellow-500/20"
            >
              <Trophy className="w-4 h-4 mr-1.5" />
              Full Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <div className="bg-white/5 backdrop-blur-sm rounded p-2 border border-white/10 text-center hover:border-yellow-500/30 transition-colors">
            <Trophy className="w-3 h-3 text-yellow-400 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-white">{achievementCount}</p>
            <p className="text-[9px] text-gray-400">Achievements</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded p-2 border border-white/10 text-center hover:border-orange-500/30 transition-colors">
            <Star className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-white">{totalPoints}</p>
            <p className="text-[9px] text-gray-400">Total Points</p>
          </div>

          <Link href="/arcade" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded p-2 border border-white/10 text-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
              <Gamepad2 className="w-3 h-3 text-cyan-400 mx-auto mb-0.5 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-white">{Math.max(stats.stats?.arcadeHighScore || 0, stats.stats?.botBattleHighScore || 0)}</p>
              <p className="text-[9px] text-gray-400">Arcade Score</p>
            </div>
          </Link>

          <div className="bg-white/5 backdrop-blur-sm rounded p-2 border border-white/10 text-center hover:border-purple-500/30 transition-colors">
            <Award className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-white">{Math.round((achievementCount / totalAchievements) * 100)}%</p>
            <p className="text-[9px] text-gray-400">Completion</p>
          </div>
        </div>

        {/* Arcade Stats Row - Ultra Compact */}
        {stats.stats?.arcadeGamesPlayed > 0 && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Gamepad2 className="w-3 h-3 text-cyan-400" />
              <h4 className="text-[10px] font-semibold text-cyan-400">Arcade Stats</h4>
            </div>

            {/* Lifetime High Score - Compact */}
            {(stats.user as any)?.lifetimeHighScore > 0 && (
              <div className="mb-1.5 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded p-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-yellow-400/90">LIFETIME</span>
                  <span className="text-sm font-black text-yellow-400 font-mono">
                    {((stats.user as any).lifetimeHighScore).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Compact Game Stats */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-cyan-400/70">Memory Match</span>
                <span className="text-white font-bold">{stats.stats?.arcadeHighScore || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-purple-400/70">Bot Battle</span>
                <span className="text-white font-bold">{stats.stats?.botBattleHighScore || 0}</span>
              </div>
              {(stats.stats?.botSlotsHighScore || 0) > 0 && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-yellow-400/70">Jackpot 🎰</span>
                  <span className="text-white font-bold">{stats.stats?.botSlotsHighScore || 0}</span>
                </div>
              )}
              {(stats.stats?.botRunnerHighScore || 0) > 0 && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-green-400/70">Runner 👻</span>
                  <span className="text-white font-bold">{stats.stats?.botRunnerHighScore || 0}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Achievements - Compact */}
        {recentAchievements.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Recent Achievements
            </h4>
            <div className="space-y-1">
              {recentAchievements.map((ua: any) => (
                <div 
                  key={ua.id}
                  className="bg-white/5 backdrop-blur-sm rounded p-1.5 border border-white/10 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="text-base">{ua.achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-white truncate">
                          {ua.achievement.name}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getTierBadge(ua.achievement.tier)} border text-[9px] px-1.5 py-0`}>
                      {ua.achievement.points}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No achievements yet */}
        {achievementCount === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded p-3 border border-white/10 text-center">
            <Trophy className="w-6 h-6 text-yellow-400/50 mx-auto mb-1" />
            <p className="text-[10px] text-gray-300 font-semibold mb-0.5">No achievements yet!</p>
            <p className="text-[9px] text-gray-400">
              Start hiring bots and chatting to unlock!
            </p>
          </div>
        )}

        {/* Progress Bar - Compact */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-gray-400">Achievement Progress</span>
            <span className="text-yellow-400 font-semibold">{achievementCount}/{totalAchievements}</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${totalAchievements > 0 ? (achievementCount / totalAchievements) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

