'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TIER_INFO } from '@/lib/achievements';
import { X, Sparkles, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementUnlockModalProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: 1 | 2 | 3;
    points: number;
  };
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const tierInfo = TIER_INFO[achievement.tier];

  useEffect(() => {
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* Animated backdrop with radial gradient */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto" onClick={onClose} />

      {/* Particle effects container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles 
              className={`w-4 h-4 ${tierInfo.color}`}
              style={{
                filter: 'drop-shadow(0 0 8px currentColor)',
              }}
            />
          </div>
        ))}

        {/* Shooting stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute animate-shooting-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Star className={`w-6 h-6 ${tierInfo.color}`} />
          </div>
        ))}
      </div>

      {/* Main achievement card */}
      <Card className="relative z-10 w-full max-w-md mx-4 bg-gray-900/95 border-2 pointer-events-auto animate-in zoom-in-95 duration-700 overflow-hidden">
        {/* Animated border glow */}
        <div 
          className={`absolute inset-0 ${tierInfo.border} animate-pulse-glow`}
          style={{
            boxShadow: `0 0 40px currentColor`,
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="relative pt-12 pb-8 px-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 animate-in slide-in-from-top duration-700">
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span className="text-yellow-400 font-bold font-orbitron text-lg">
                ACHIEVEMENT UNLOCKED!
              </span>
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>

          {/* Main badge with epic spin animation */}
          <div className="relative mb-8 flex justify-center">
            {/* Outer rotating ring */}
            <div className={`absolute inset-0 rounded-full ${tierInfo.border} animate-spin-slow`}
              style={{
                width: '180px',
                height: '180px',
                margin: 'auto',
                boxShadow: `0 0 60px currentColor, inset 0 0 20px currentColor`,
              }}
            />

            {/* Middle pulsing ring */}
            <div className={`absolute inset-0 rounded-full ${tierInfo.bg} animate-ping-slow`}
              style={{
                width: '160px',
                height: '160px',
                margin: 'auto',
                opacity: 0.5,
              }}
            />

            {/* Badge container with 3D flip effect */}
            <div 
              className="relative w-40 h-40 rounded-full flex items-center justify-center animate-flip-3d"
              style={{
                background: `linear-gradient(135deg, ${tierInfo.bg} 0%, rgba(0,0,0,0.3) 100%)`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px currentColor`,
              }}
            >
              {/* Inner glow */}
              <div className={`absolute inset-0 rounded-full ${tierInfo.bg} blur-2xl animate-pulse`} />
              
              {/* Badge icon */}
              <div className="relative z-10 text-8xl animate-bounce-in" style={{ animationDelay: '0.5s' }}>
                {achievement.icon}
              </div>

              {/* Orbiting sparkles */}
              <div className="absolute inset-0 animate-spin-slow">
                <Sparkles className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 ${tierInfo.color}`} />
              </div>
              <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '1s' }}>
                <Sparkles className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 ${tierInfo.color}`} />
              </div>
              <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '0.5s' }}>
                <Sparkles className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 ${tierInfo.color}`} />
              </div>
              <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '1.5s' }}>
                <Sparkles className={`absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 ${tierInfo.color}`} />
              </div>
            </div>

            {/* Light rays */}
            <div className="absolute inset-0 animate-rotate-rays" style={{ width: '200px', height: '200px', margin: 'auto' }}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-1/2 left-1/2 w-1 h-24 ${tierInfo.bg} opacity-30`}
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-50%)`,
                    transformOrigin: 'top center',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Achievement details */}
          <div className="text-center space-y-4 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-bold text-white font-orbitron">
                {achievement.name}
              </h2>
              <Badge className={`${tierInfo.bg} ${tierInfo.color} text-sm px-3 py-1 animate-pulse`}>
                {tierInfo.name}
              </Badge>
            </div>

            <p className="text-gray-300 text-lg">
              {achievement.description}
            </p>

            {/* Points earned */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 ${tierInfo.bg} rounded-full border-2 ${tierInfo.border} animate-bounce-in`} style={{ animationDelay: '1s' }}>
              <Star className={`w-6 h-6 ${tierInfo.color} animate-spin-slow`} />
              <span className={`text-2xl font-bold ${tierInfo.color}`}>
                +{achievement.points}
              </span>
              <span className="text-gray-300 font-semibold">POINTS</span>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-8 text-center animate-in fade-in duration-700" style={{ animationDelay: '1.2s' }}>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-3 text-lg font-orbitron"
            >
              AWESOME!
            </Button>
          </div>

          {/* Confetti burst effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute animate-confetti"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '10px',
                  height: '10px',
                  background: [
                    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
                    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'
                  ][i % 8],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                  transform: `rotate(${Math.random() * 360}deg) translateX(${(Math.random() - 0.5) * 400}px) translateY(${(Math.random() - 0.5) * 400}px)`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) scale(1.5);
            opacity: 1;
          }
        }

        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(-45deg);
            opacity: 0;
          }
        }

        @keyframes flip-3d {
          0% {
            transform: perspective(1000px) rotateY(0deg) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: perspective(1000px) rotateY(180deg) scale(1.2);
          }
          100% {
            transform: perspective(1000px) rotateY(360deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes rotate-rays {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 0), var(--ty, 300px)) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-float-particle {
          animation: float-particle 3s ease-in-out infinite;
        }

        .animate-shooting-star {
          animation: shooting-star 1.5s linear forwards;
        }

        .animate-flip-3d {
          animation: flip-3d 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-rotate-rays {
          animation: rotate-rays 8s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

