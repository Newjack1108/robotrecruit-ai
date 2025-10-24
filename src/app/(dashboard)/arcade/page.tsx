import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/arcade/Leaderboard';
import { Gamepad2, Trophy, PlayCircle, Target, Zap, Coins } from 'lucide-react';

export default async function ArcadePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Gamepad2 className="w-20 h-20 text-cyan-400" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-ping" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full" />
            </div>
          </div>
          <h1 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Bot Arcade
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Test your skills and compete with others! Choose your game and climb the leaderboards!
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Bot Jackpot Slots Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30 overflow-hidden">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-xl" />
              
              <div className="relative p-6">
                <div className="space-y-4">
                  {/* Game Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Bot Jackpot</h2>
                    </div>
                    <p className="text-gray-300">
                      Match 3 bots to win big! Daily free spins with points and rare credit prizes!
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>10 free spins daily</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Win powerup credits!</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Link href="/arcade/bot-slots">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-lg transform transition-transform hover:scale-105 group">
                      <PlayCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      Spin Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Bot Memory Match Card */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/30 overflow-hidden">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl" />
              
              <div className="relative p-6">
                <div className="space-y-4">
                  {/* Game Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Bot Memory Match</h2>
                    </div>
                    <p className="text-gray-300">
                      Flip cards to find matching bot pairs. Perfect games earn bonus points!
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>12 cards • 6 bot pairs</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Daily leaderboards</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Link href="/arcade/bot-memory">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 rounded-lg transform transition-transform hover:scale-105 group">
                      <PlayCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Bot Battle Arena Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/30 overflow-hidden">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl" />
              
              <div className="relative p-6">
                <div className="space-y-4">
                  {/* Game Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Bot Battle Arena</h2>
                    </div>
                    <p className="text-gray-300">
                      Click the target bot before it disappears! Fast reflexes and streaks earn huge bonuses!
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span>5 rounds • Progressive difficulty</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Streak multipliers & bonuses</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Link href="/arcade/bot-battle">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-lg transform transition-transform hover:scale-105 group">
                      <PlayCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboards Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Today's Top Players
            </h2>
            <p className="text-sm text-gray-400 mt-2">Resets daily at midnight UTC</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Link href="/arcade/bot-slots" className="group">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Coins className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Bot Jackpot
                  <PlayCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>
              <Leaderboard gameType="bot_slots" period="daily" limit={5} />
            </div>
            <div>
              <Link href="/arcade/bot-memory" className="group">
                <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2 hover:text-cyan-300 transition-colors cursor-pointer">
                  <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Bot Memory Match
                  <PlayCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>
              <Leaderboard gameType="bot_memory_match" period="daily" limit={5} />
            </div>
            <div>
              <Link href="/arcade/bot-battle" className="group">
                <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2 hover:text-purple-300 transition-colors cursor-pointer">
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Bot Battle Arena
                  <PlayCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>
              <Leaderboard gameType="bot_battle_arena" period="daily" limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

