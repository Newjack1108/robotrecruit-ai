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
    fetchStats();
    
    // Refresh stats when achievements are unlocked
    const handleAchievementUnlock = () => {
      console.log('[ProfileStatsCard] Achievement unlocked, refreshing stats...');
      fetchStats();
    };
    
    window.addEventListener('achievementUnlocked', handleAchievementUnlock);
    
    // Also poll every 15 seconds to catch any updates
    const interval = setInterval(fetchStats, 15000);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlock);
      clearInterval(interval);
    };
  }, []);

  async function fetchStats() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const json = await response.json();
        setStats(json);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
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
              variant="ghost" 
              size="sm"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 text-xs h-8 px-2"
            >
              Full Profile
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center hover:border-yellow-500/30 transition-colors">
            <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{achievementCount}</p>
            <p className="text-[10px] text-gray-400">Achievements</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center hover:border-orange-500/30 transition-colors">
            <Star className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{totalPoints}</p>
            <p className="text-[10px] text-gray-400">Total Points</p>
          </div>

          <Link href="/arcade" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
              <Gamepad2 className="w-4 h-4 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xl font-bold text-white">{Math.max(stats.stats?.arcadeHighScore || 0, stats.stats?.botBattleHighScore || 0)}</p>
              <p className="text-[10px] text-gray-400">Arcade Score</p>
            </div>
          </Link>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center hover:border-purple-500/30 transition-colors">
            <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{Math.round((achievementCount / totalAchievements) * 100)}%</p>
            <p className="text-[10px] text-gray-400">Completion</p>
          </div>
        </div>

        {/* Arcade Stats Row */}
        {stats.stats?.arcadeGamesPlayed > 0 && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-cyan-400">Arcade Stats</h4>
            </div>
            
            {/* Bot Memory Match */}
            <div className="mb-2">
              <p className="text-[10px] text-cyan-400/70 mb-1.5">Bot Memory Match</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {stats.stats?.perfectGame && <Zap className="w-3 h-3 text-yellow-400" />}
                    <p className="text-base font-bold text-white">{stats.stats?.arcadeHighScore || 0}</p>
                  </div>
                  <p className="text-[10px] text-gray-400">High Score</p>
                </div>
                <div className="text-center">
                  {stats.stats?.leaderboardTop3 ? (
                    <>
                      <p className="text-base font-bold text-yellow-400">🏆 Top</p>
                      <p className="text-[10px] text-yellow-400/70">Rank</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-white">-</p>
                      <p className="text-[10px] text-gray-400">Rank</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {stats.stats?.perfectGame ? (
                    <>
                      <p className="text-base font-bold text-green-400">💯</p>
                      <p className="text-[10px] text-green-400/70">Perfect</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-white">-</p>
                      <p className="text-[10px] text-gray-400">Perfect</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bot Battle Arena */}
            <div className="pt-2 border-t border-cyan-500/10">
              <p className="text-[10px] text-purple-400/70 mb-1.5">Bot Battle Arena</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {(stats.stats?.botBattleMaxStreak || 0) >= 10 && <Zap className="w-3 h-3 text-yellow-400" />}
                    <p className="text-base font-bold text-white">{stats.stats?.botBattleHighScore || 0}</p>
                  </div>
                  <p className="text-[10px] text-gray-400">High Score</p>
                </div>
                <div className="text-center">
                  {(stats.stats?.botBattleMaxStreak || 0) > 0 ? (
                    <>
                      <p className="text-base font-bold text-orange-400">🔥 {stats.stats?.botBattleMaxStreak}</p>
                      <p className="text-[10px] text-orange-400/70">Streak</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-white">-</p>
                      <p className="text-[10px] text-gray-400">Streak</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {stats.stats?.botBattlePerfectGame ? (
                    <>
                      <p className="text-base font-bold text-green-400">💯</p>
                      <p className="text-[10px] text-green-400/70">Flawless</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-white">-</p>
                      <p className="text-[10px] text-gray-400">Flawless</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bot Jackpot Slots */}
            {(stats.stats?.botSlotsHighScore || 0) > 0 && (
              <div className="pt-2 border-t border-cyan-500/10">
                <p className="text-[10px] text-yellow-400/70 mb-1.5">Bot Jackpot 🎰</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {(stats.stats?.botSlotsJackpots || 0) > 0 && <Zap className="w-3 h-3 text-yellow-400" />}
                      <p className="text-base font-bold text-white">{stats.stats?.botSlotsHighScore || 0}</p>
                    </div>
                    <p className="text-[10px] text-gray-400">High Score</p>
                  </div>
                  <div className="text-center">
                    {(stats.stats?.botSlotsJackpots || 0) > 0 ? (
                      <>
                        <p className="text-base font-bold text-yellow-400">🎰 {stats.stats?.botSlotsJackpots}</p>
                        <p className="text-[10px] text-yellow-400/70">Jackpots</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-bold text-white">-</p>
                        <p className="text-[10px] text-gray-400">Jackpots</p>
                      </>
                    )}
                  </div>
                  <div className="text-center">
                    {(stats.stats?.botSlotsCreditsWon || 0) > 0 ? (
                      <>
                        <p className="text-base font-bold text-purple-400">💎 {stats.stats?.botSlotsCreditsWon}</p>
                        <p className="text-[10px] text-purple-400/70">Won</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-bold text-white">-</p>
                        <p className="text-[10px] text-gray-400">Won</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {stats.stats?.perfectGame && (
              <div className="mt-2 pt-2 border-t border-cyan-500/20">
                <div className="flex items-center justify-center gap-1.5 text-yellow-400">
                  <Zap className="w-3 h-3 animate-pulse" />
                  <p className="text-[10px] font-semibold">Perfect Game!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-yellow-400 flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              Recent Achievements
            </h4>
            <div className="space-y-1.5">
              {recentAchievements.map((ua: any) => (
                <div 
                  key={ua.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="text-xl">{ua.achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {ua.achievement.name}
                        </p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">
                          {ua.achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <Badge className={`${getTierBadge(ua.achievement.tier)} border text-[10px] px-1.5 py-0`}>
                        {ua.achievement.points}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No achievements yet */}
        {achievementCount === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
            <Trophy className="w-8 h-8 text-yellow-400/50 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-semibold mb-1">No achievements yet!</p>
            <p className="text-[10px] text-gray-400">
              Start hiring bots and chatting to unlock achievements!
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Achievement Progress</span>
            <span className="text-yellow-400 font-semibold">{achievementCount}/{totalAchievements}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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

