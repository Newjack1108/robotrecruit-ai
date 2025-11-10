'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Loader2, TrendingUp, Award, Snowflake, ShoppingCart } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  streakPoints: number;
  lastCheckIn: string | null;
  isStreakActive: boolean;
  canCheckInToday: boolean;
  streakFreezes: number;
}

interface StreakCounterProps {
  variant?: 'header' | 'dashboard';
  onStreakUpdate?: () => void;
  className?: string;
}

export function StreakCounter({ variant = 'header', onStreakUpdate, className }: StreakCounterProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isBuyingFreeze, setIsBuyingFreeze] = useState(false);

  useEffect(() => {
    fetchStreakData(true); // Initial load with loading state

    // Refresh every minute
    const interval = setInterval(() => fetchStreakData(false), 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStreakData(showLoading = false) {
    try {
      const response = await fetch('/api/streaks');
      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  async function handleCheckIn() {
    setIsCheckingIn(true);
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        await fetchStreakData();

        if (onStreakUpdate) {
          onStreakUpdate();
        }

        // Show celebration if milestone reached
        if (data.milestoneReached) {
          const messages = [];
          if (data.bonusPoints > 0) messages.push(`+${data.bonusPoints} bonus points`);
          if (data.bonusFreezes > 0) messages.push(`+${data.bonusFreezes} streak freeze${data.bonusFreezes > 1 ? 's' : ''}`);
          alert(`🎉 ${data.milestoneReached} Day Streak Milestone! ${messages.join(' and ')}!`);
        }
      }
    } catch (error) {
      console.error('Failed to check in:', error);
    } finally {
      setIsCheckingIn(false);
    }
  }
  
  async function handleBuyFreeze() {
    if (!confirm('Purchase 1 streak freeze for 5 power-up credits?')) {
      return;
    }
    
    setIsBuyingFreeze(true);
    try {
      const response = await fetch('/api/streaks/buy-freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchStreakData();
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ ${data.error || 'Failed to purchase freeze'}`);
      }
    } catch (error) {
      console.error('Failed to buy freeze:', error);
      alert('❌ Failed to purchase freeze');
    } finally {
      setIsBuyingFreeze(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  // Header variant (compact for top navigation)
  if (variant === 'header') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCheckIn}
        disabled={!streakData.canCheckInToday || isCheckingIn}
        className={`flex items-center gap-2 ${
          streakData.canCheckInToday 
            ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10' 
            : 'text-gray-400'
        } ${className || ''}`}
        title={streakData.canCheckInToday ? 'Click to check in!' : 'Already checked in today'}
      >
        <Flame className={`w-4 h-4 ${streakData.canCheckInToday ? 'animate-pulse' : ''}`} />
        <span className="font-bold font-orbitron">{streakData.currentStreak}</span>
        {streakData.canCheckInToday && (
          <span className="text-xs">Check In</span>
        )}
      </Button>
    );
  }

  // Dashboard variant (full card)
  return (
    <div className="bg-gradient-to-br from-orange-900/30 via-red-900/30 to-pink-900/30 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden h-full flex flex-col">
      {/* Animated flame background */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 via-red-500/5 to-transparent animate-pulse"></div>

      <div className="relative z-10 space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className={`w-8 h-8 text-orange-400 ${streakData.canCheckInToday ? 'animate-bounce' : ''}`} />
            <div>
              <h3 className="text-xl font-orbitron font-bold text-white">Daily Streak</h3>
              <p className="text-sm text-gray-400">Keep the fire burning! 🔥</p>
            </div>
          </div>
          {streakData.canCheckInToday && (
            <Button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold"
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 mr-2" />
                  Check In Now!
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <p className="text-xs text-gray-400">Current</p>
            </div>
            <p className="text-2xl font-bold text-white font-orbitron">{streakData.currentStreak}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">Longest</p>
            </div>
            <p className="text-2xl font-bold text-white font-orbitron">{streakData.longestStreak}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Points</p>
            </div>
            <p className="text-2xl font-bold text-white font-orbitron">{streakData.streakPoints}</p>
            <p className="text-xs text-gray-500">earned</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-gray-400">Freezes</p>
            </div>
            <p className="text-2xl font-bold text-white font-orbitron">{streakData.streakFreezes}</p>
            <p className="text-xs text-gray-500">available</p>
          </div>
        </div>

        {/* Streak Protection Info */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-300 font-bold">Streak Protection</p>
            </div>
            <Button
              size="sm"
              onClick={handleBuyFreeze}
              disabled={isBuyingFreeze}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs h-7"
            >
              {isBuyingFreeze ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Buying...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Buy (5 credits)
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-300">
            Freezes auto-protect your streak if you miss a day. Earn them at 7, 30, and 100-day milestones!
          </p>
        </div>
        
        {/* Next Milestone */}
        {streakData.currentStreak > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <p className="text-xs text-orange-300 mb-1">Next Milestone</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">
                {streakData.currentStreak < 3 && '3 Days: +50 points'}
                {streakData.currentStreak >= 3 && streakData.currentStreak < 7 && '7 Days: +100 points + 1 freeze'}
                {streakData.currentStreak >= 7 && streakData.currentStreak < 14 && '14 Days: +250 points'}
                {streakData.currentStreak >= 14 && streakData.currentStreak < 30 && '30 Days: +500 points + 1 freeze'}
                {streakData.currentStreak >= 30 && streakData.currentStreak < 100 && '100 Days: +1000 points + 1 freeze'}
                {streakData.currentStreak >= 100 && 'Legend Status! Keep going!'}
              </span>
            </div>
          </div>
        )}

        {/* Already checked in message */}
        {!streakData.canCheckInToday && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-green-400 font-bold">✅ Checked in today!</p>
            <p className="text-xs text-green-300 mt-1">Come back tomorrow to continue your streak</p>
          </div>
        )}
      </div>

      {/* Decorative flames */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
    </div>
  );
}

