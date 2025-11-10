'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Coins, Flame, Snowflake, Gift } from 'lucide-react';

interface WheelStatus {
  spinsRemaining: number;
  baseSpins: number;
  bonusSpins: number;
  bonusReasons: string[];
  totalSpins: number;
  canSpin: boolean;
}

interface WheelReward {
  type: string;
  value: number;
  label: string;
}

const WHEEL_SEGMENTS = [
  { label: '1 Credit', color: 'from-blue-600 to-blue-700', icon: Coins },
  { label: '25 Points', color: 'from-yellow-600 to-yellow-700', icon: Sparkles },
  { label: '3 Credits', color: 'from-purple-600 to-purple-700', icon: Coins },
  { label: '50 Points', color: 'from-green-600 to-green-700', icon: Sparkles },
  { label: '5 Credits', color: 'from-cyan-600 to-cyan-700', icon: Coins },
  { label: '100 Points!', color: 'from-orange-600 to-orange-700', icon: Sparkles },
  { label: '10 Credits!', color: 'from-pink-600 to-pink-700', icon: Coins },
  { label: 'Freeze!', color: 'from-indigo-600 to-indigo-700', icon: Snowflake },
];

export function DailyRewardWheel() {
  const [status, setStatus] = useState<WheelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<WheelReward | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wheel/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch wheel status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSpin() {
    if (!status?.canSpin) return;

    setIsSpinning(true);
    setReward(null);

    try {
      const response = await fetch('/api/wheel/spin', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Calculate rotation for animation (3-5 full spins + final position)
        const fullSpins = 3 + Math.random() * 2;
        const segmentAngle = 360 / WHEEL_SEGMENTS.length;
        
        // Find which segment matches the reward
        const rewardIndex = WHEEL_SEGMENTS.findIndex(seg => 
          seg.label.toLowerCase().includes(data.reward.type === 'credits' ? 'credit' : 
                                           data.reward.type === 'points' ? 'point' : 'freeze')
        );
        
        const targetAngle = rewardIndex * segmentAngle;
        const totalRotation = (fullSpins * 360) + targetAngle;
        
        // Animate the spin
        setRotation(prev => prev + totalRotation);
        
        // Wait for animation to complete
        setTimeout(() => {
          setReward(data.reward);
          setIsSpinning(false);
          fetchStatus(); // Refresh status
        }, 4000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to spin wheel');
        setIsSpinning(false);
      }
    } catch (error) {
      console.error('Failed to spin wheel:', error);
      alert('Failed to spin wheel');
      setIsSpinning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-400">Failed to load wheel status</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Gift className="w-16 h-16 text-yellow-400 animate-bounce" />
        </div>
        <h2 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
          Daily Reward Wheel
        </h2>
        <p className="text-gray-300 text-lg">Spin the wheel for amazing prizes!</p>
        
        {/* Spins Available */}
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg px-6 py-2">
            <Sparkles className="w-5 h-5 mr-2" />
            {status.spinsRemaining} Spin{status.spinsRemaining !== 1 ? 's' : ''} Available
          </Badge>
        </div>
        
        {/* Bonus Info */}
        {status.bonusSpins > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-green-400 font-bold text-sm">
              🎁 +{status.bonusSpins} Bonus Spin{status.bonusSpins > 1 ? 's' : ''}: {status.bonusReasons.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Wheel */}
      <div className="relative max-w-md mx-auto">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500"></div>
        </div>
        
        {/* Wheel Container */}
        <div className="relative w-full aspect-square rounded-full overflow-hidden border-8 border-gray-800 shadow-2xl">
          {/* Spinning Wheel */}
          <div
            className="absolute inset-0 transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_SEGMENTS.map((segment, index) => {
              const angle = (360 / WHEEL_SEGMENTS.length) * index;
              const Icon = segment.icon;
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 origin-center bg-gradient-to-br ${segment.color}`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%, ${50 + 50 * Math.sin(((angle + 360 / WHEEL_SEGMENTS.length) * Math.PI) / 180)}% ${50 - 50 * Math.cos(((angle + 360 / WHEEL_SEGMENTS.length) * Math.PI) / 180)}%)`,
                  }}
                >
                  <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{
                      transform: `rotate(${angle + 360 / WHEEL_SEGMENTS.length / 2}deg)`,
                    }}
                  >
                    <Icon className="w-6 h-6 text-white mb-1" />
                    <span className="text-white font-bold text-xs whitespace-nowrap">{segment.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-yellow-400 shadow-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleSpin}
          disabled={!status.canSpin || isSpinning}
          className="bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 hover:from-yellow-500 hover:via-orange-500 hover:to-pink-500 text-white font-bold text-xl px-12 py-6 disabled:opacity-50"
        >
          {isSpinning ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              Spinning...
            </>
          ) : !status.canSpin ? (
            'No Spins Available'
          ) : (
            <>
              <Gift className="w-6 h-6 mr-3" />
              SPIN NOW!
            </>
          )}
        </Button>
      </div>

      {/* Reward Display */}
      {reward && (
        <div className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-pink-900/30 border border-yellow-500/50 rounded-xl p-8 text-center animate-pulse">
          <div className="mb-4">
            <div className="inline-block p-4 bg-yellow-400/20 rounded-full">
              {reward.type === 'credits' && <Coins className="w-16 h-16 text-yellow-400" />}
              {reward.type === 'points' && <Sparkles className="w-16 h-16 text-orange-400" />}
              {reward.type === 'freeze' && <Snowflake className="w-16 h-16 text-cyan-400" />}
            </div>
          </div>
          <h3 className="text-3xl font-orbitron font-bold text-white mb-2">
            🎉 You Won! 🎉
          </h3>
          <p className="text-5xl font-black text-yellow-400 mb-2">{reward.label}</p>
          <p className="text-gray-300 text-lg">
            {status.spinsRemaining > 0 
              ? `You have ${status.spinsRemaining} more spin${status.spinsRemaining !== 1 ? 's' : ''} today!`
              : 'Come back tomorrow for more spins!'}
          </p>
        </div>
      )}

      {/* No Spins Message */}
      {!status.canSpin && !isSpinning && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-300 text-lg mb-2">
            You've used all your spins for today!
          </p>
          <p className="text-gray-400 text-sm">
            Come back tomorrow for more chances to win. <br />
            💡 Tip: Complete daily challenges and maintain a 7+ day streak for bonus spins!
          </p>
        </div>
      )}
    </div>
  );
}

