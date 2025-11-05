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
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionSpins, setSessionSpins] = useState<Array<{winType: string, points: number, credits: number}>>([]);

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
      
      // Reset session if spins are full (new day)
      if (data.spinsLeft === 10) {
        setTotalPoints(0);
        setTotalCredits(0);
        setSessionStarted(false);
        setSessionSpins([]);
      }
    } catch (error) {
      console.error('Failed to fetch spin status:', error);
      setLoading(false);
    }
  };

  const handleSpin = async (result: string[]) => {
    if (!sessionStarted) {
      setSessionStarted(true);
    }
    
    try {
      const res = await fetch('/api/arcade/slots/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, sessionTotal: totalPoints })
      });
      
      const data = await res.json();
      setSpinsLeft(data.spinsLeft);
      
      const newTotalPoints = totalPoints + data.pointsWon;
      const newTotalCredits = totalCredits + data.creditsWon;
      
      setTotalPoints(newTotalPoints);
      setTotalCredits(newTotalCredits);
      
      // Track spin results for final summary
      setSessionSpins(prev => [...prev, {
        winType: data.winType,
        points: data.pointsWon,
        credits: data.creditsWon
      }]);
      
      return {
        ...data,
        sessionTotal: newTotalPoints,
        sessionCredits: newTotalCredits,
        sessionSpins: sessionSpins.length + 1
      };
    } catch (error) {
      console.error('Failed to submit spin:', error);
      return { pointsWon: 0, creditsWon: 0, winType: 'small', isLastSpin: false };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950/30 to-cyan-950/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Link href="/arcade">
          <Button variant="ghost" className="text-gray-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
        </Link>

        {/* Game Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎰 Bot Jackpot
          </h1>
          <p className="text-gray-300 text-lg">Match the bots to win points and credits!</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl border-cyan-500/50 p-4 text-center hover:border-cyan-400/70 transition-all">
            <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{spinsLeft}</div>
            <div className="text-sm text-cyan-200/70">Spins Left</div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border-purple-500/50 p-4 text-center hover:border-purple-400/70 transition-all">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalPoints}</div>
            <div className="text-sm text-purple-200/70">Points Won</div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl border-blue-500/50 p-4 text-center hover:border-blue-400/70 transition-all">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">{timeToReset}</div>
            <div className="text-xs text-blue-200/70">Until Reset</div>
          </Card>
        </div>

        {/* Slot Machine */}
        <BotSlotMachine 
          spinsLeft={spinsLeft}
          onSpin={handleSpin}
          disabled={spinsLeft === 0}
          sessionSpins={sessionSpins}
          totalPoints={totalPoints}
          totalCredits={totalCredits}
        />

        {/* Rewards Table */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-cyan-900/30 backdrop-blur-xl border-cyan-500/30 p-6">
          <h3 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">Winning Combinations</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/50 hover:border-purple-400 transition-colors">
              <span className="text-white font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Three of a Kind
              </span>
              <span className="text-yellow-400 font-bold text-lg">1,000 pts + 3 Credits!</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors">
              <span className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Two Matching
              </span>
              <span className="text-cyan-400 font-bold">100 pts + 1 Credit</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
              <span className="text-gray-300">❌ No Match</span>
              <span className="text-gray-400">10 points</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/50 backdrop-blur-sm">
            <p className="text-sm text-purple-200 text-center leading-relaxed">
              💎 <strong className="text-yellow-300">Win Credits!</strong> Jackpots award 3 credits, matches award 1 credit. 
              Your total session points boost your leaderboard ranking!
            </p>
          </div>
        </Card>

        {/* Daily Reset Info */}
        {spinsLeft === 0 && (
          <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl border-orange-500/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-orbitron text-white mb-3">Out of Spins!</h3>
            <p className="text-gray-200 text-lg mb-6">
              Come back in <strong className="text-orange-400">{timeToReset}</strong> for 10 more free spins!
            </p>
            <Link href="/arcade">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg">
                Play Other Games
              </Button>
            </Link>
          </Card>
        )}

      </div>
    </div>
  );
}

