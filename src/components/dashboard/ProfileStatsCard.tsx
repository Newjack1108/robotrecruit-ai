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

  // Get recent achievements (last 3)
  const recentAchievements = stats.unlockedAchievements?.slice(0, 3) || [];

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl font-orbitron">Profile & Achievements</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Your progress and accolades</p>
            </div>
          </div>
          <Link href="/profile">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            >
              View Full Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:border-yellow-500/30 transition-colors">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{achievementCount}</p>
            <p className="text-xs text-gray-400">Achievements</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:border-orange-500/30 transition-colors">
            <Star className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalPoints}</p>
            <p className="text-xs text-gray-400">Total Points</p>
          </div>

          <Link href="/arcade" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:border-cyan-500/50 transition-colors cursor-pointer group">
              <Gamepad2 className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white">{Math.max(stats.stats?.arcadeHighScore || 0, stats.stats?.botBattleHighScore || 0)}</p>
              <p className="text-xs text-gray-400">Arcade High Score</p>
            </div>
          </Link>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:border-purple-500/30 transition-colors">
            <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Math.round((achievementCount / totalAchievements) * 100)}%</p>
            <p className="text-xs text-gray-400">Completion</p>
          </div>
        </div>

        {/* Arcade Stats Row */}
        {stats.stats?.arcadeGamesPlayed > 0 && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-semibold text-cyan-400">Arcade Stats</h4>
            </div>
            
            {/* Bot Memory Match */}
            <div className="mb-3">
              <p className="text-xs text-cyan-400/70 mb-2">Bot Memory Match</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {stats.stats?.perfectGame && <Zap className="w-4 h-4 text-yellow-400" />}
                    <p className="text-lg font-bold text-white">{stats.stats?.arcadeHighScore || 0}</p>
                  </div>
                  <p className="text-xs text-gray-400">High Score</p>
                </div>
                <div className="text-center">
                  {stats.stats?.leaderboardTop3 ? (
                    <>
                      <p className="text-lg font-bold text-yellow-400">🏆 Top 3</p>
                      <p className="text-xs text-yellow-400/70">Today</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-white">-</p>
                      <p className="text-xs text-gray-400">Rank</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {stats.stats?.perfectGame ? (
                    <>
                      <p className="text-lg font-bold text-green-400">💯 Yes</p>
                      <p className="text-xs text-green-400/70">Perfect</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-white">-</p>
                      <p className="text-xs text-gray-400">Perfect</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bot Battle Arena */}
            <div className="pt-3 border-t border-cyan-500/10">
              <p className="text-xs text-purple-400/70 mb-2">Bot Battle Arena</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {(stats.stats?.botBattleMaxStreak || 0) >= 10 && <Zap className="w-4 h-4 text-yellow-400" />}
                    <p className="text-lg font-bold text-white">{stats.stats?.botBattleHighScore || 0}</p>
                  </div>
                  <p className="text-xs text-gray-400">High Score</p>
                </div>
                <div className="text-center">
                  {(stats.stats?.botBattleMaxStreak || 0) > 0 ? (
                    <>
                      <p className="text-lg font-bold text-orange-400">🔥 {stats.stats?.botBattleMaxStreak}</p>
                      <p className="text-xs text-orange-400/70">Max Streak</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-white">-</p>
                      <p className="text-xs text-gray-400">Max Streak</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {stats.stats?.botBattlePerfectGame ? (
                    <>
                      <p className="text-lg font-bold text-green-400">💯 Yes</p>
                      <p className="text-xs text-green-400/70">Flawless</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-white">-</p>
                      <p className="text-xs text-gray-400">Flawless</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            {stats.stats?.perfectGame && (
              <div className="mt-3 pt-3 border-t border-cyan-500/20">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <p className="text-xs font-semibold">Perfect Game Achieved!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {recentAchievements.map((ua: any) => (
                <div 
                  key={ua.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{ua.achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {ua.achievement.name}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {ua.achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${getTierBadge(ua.achievement.tier)} border text-xs px-2 py-0`}>
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
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
            <Trophy className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
            <p className="text-gray-300 font-semibold mb-1">No achievements yet!</p>
            <p className="text-xs text-gray-400">
              Start hiring bots, chatting, and engaging with the community to unlock achievements!
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Achievement Progress</span>
            <span className="text-yellow-400 font-semibold">{achievementCount}/{totalAchievements}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(achievementCount / totalAchievements) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

