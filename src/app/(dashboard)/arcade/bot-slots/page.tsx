'use client';

import { useState, useEffect } from 'react';
import { BotSlotMachine } from '@/components/arcade/BotSlotMachine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function BotSlotsPage() {
  const [spinsLeft, setSpinsLeft] = useState(10);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [timeToReset, setTimeToReset] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpinStatus();
  }, []);

  const fetchSpinStatus = async () => {
    try {
      const res = await fetch('/api/arcade/slots/status');
      const data = await res.json();
      setSpinsLeft(data.spinsLeft);
      setTimeToReset(data.timeToReset);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch spin status:', error);
      setLoading(false);
    }
  };

  const handleSpin = async (result: string[]) => {
    try {
      const res = await fetch('/api/arcade/slots/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      });
      
      const data = await res.json();
      setSpinsLeft(data.spinsLeft);
      setTotalPoints(prev => prev + data.pointsWon);
      setTotalCredits(prev => prev + data.creditsWon);
      
      return data; // Return reward info for visual feedback
    } catch (error) {
      console.error('Failed to submit spin:', error);
      return { pointsWon: 0, creditsWon: 0, winType: 'small' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Link href="/arcade">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
        </Link>

        {/* Game Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🎰 Bot Jackpot
          </h1>
          <p className="text-gray-400">Match the bots to win points and credits!</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4 text-center">
            <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{spinsLeft}</div>
            <div className="text-sm text-gray-400">Spins Left</div>
          </Card>
          
          <Card className="bg-gray-800/50 border-yellow-500/30 p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalPoints}</div>
            <div className="text-sm text-gray-400">Points Won</div>
          </Card>
          
          <Card className="bg-gray-800/50 border-purple-500/30 p-4 text-center">
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">{timeToReset}</div>
            <div className="text-xs text-gray-400">Until Reset</div>
          </Card>
        </div>

        {/* Slot Machine */}
        <BotSlotMachine 
          spinsLeft={spinsLeft}
          onSpin={handleSpin}
          disabled={spinsLeft === 0}
        />

        {/* Rewards Table */}
        <Card className="bg-gray-800/30 border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Winning Combinations</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <span className="text-white font-semibold">🎰 Three of a Kind</span>
              <span className="text-yellow-400 font-bold">1,000 pts + 1 Credit!</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <span className="text-white">✨ Two Matching</span>
              <span className="text-cyan-400">100 points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg border border-gray-600">
              <span className="text-gray-400">❌ No Match</span>
              <span className="text-gray-500">10 points</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <p className="text-sm text-purple-300 text-center">
              💎 <strong>Credits are rare!</strong> Only jackpots award credits. 
              Points boost your leaderboard ranking!
            </p>
          </div>
        </Card>

        {/* Daily Reset Info */}
        {spinsLeft === 0 && (
          <Card className="bg-red-900/20 border-red-500/50 p-6 text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Out of Spins! 😢</h3>
            <p className="text-gray-300 mb-4">
              Come back in <strong>{timeToReset}</strong> for 10 more free spins!
            </p>
            <Link href="/arcade">
              <Button className="bg-cyan-600 hover:bg-cyan-500">
                Play Other Games
              </Button>
            </Link>
          </Card>
        )}

      </div>
    </div>
  );
}

