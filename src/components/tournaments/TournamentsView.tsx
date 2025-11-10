'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Calendar, Users, Award, Target } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  prizes: any;
  entries?: any[];
}

export function TournamentsView() {
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentTournament();
  }, []);

  async function fetchCurrentTournament() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tournaments/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentTournament(data.tournament);
      }
    } catch (error) {
      console.error('Failed to fetch tournament:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!currentTournament) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Tournament</h3>
          <p className="text-gray-400">
            Check back soon for the next weekly tournament!
          </p>
        </CardContent>
      </Card>
    );
  }

  const timeRemaining = new Date(currentTournament.endDate).getTime() - Date.now();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="space-y-6">
      {/* Current Tournament Info */}
      <Card className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 border-yellow-500/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <CardTitle className="text-2xl text-white">{currentTournament.name}</CardTitle>
              </div>
              <p className="text-gray-300">{currentTournament.description}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              ACTIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Time Remaining</span>
              </div>
              <p className="text-lg font-bold text-white">
                {daysRemaining}d {hoursRemaining}h
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Participants</span>
              </div>
              <p className="text-lg font-bold text-white">
                {currentTournament.entries?.length || 0}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Game Type</span>
              </div>
              <p className="text-lg font-bold text-white capitalize">
                {currentTournament.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Prizes */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Prizes
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(currentTournament.prizes).map(([place, prize]: [string, any]) => (
                <div key={place} className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white font-bold mb-1">{place}</p>
                  <div className="text-xs text-gray-300">
                    {prize.credits && <div>{prize.credits} Credits</div>}
                    {prize.points && <div>{prize.points} Points</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
            <p className="text-cyan-300 text-sm">
              💡 <strong>How to Enter:</strong> Play {currentTournament.type.replace('_', ' ')} in the Arcade! 
              Your highest score during the tournament automatically enters you.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-gray-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentTournament.entries || currentTournament.entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No entries yet. Be the first to compete!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentTournament.entries.slice(0, 10).map((entry: any, index: number) => {
                const rank = entry.rank || index + 1;
                const isTop3 = rank <= 3;
                const medalColors = ['text-yellow-400', 'text-gray-400', 'text-orange-600'];
                
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isTop3 ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30' : 'bg-gray-900/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isTop3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {isTop3 ? (
                          <Trophy className={`w-5 h-5 ${medalColors[rank - 1]}`} />
                        ) : (
                          rank
                        )}
                      </div>
                      <span className="text-white font-semibold">{entry.user.email}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white font-mono">{entry.score.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

