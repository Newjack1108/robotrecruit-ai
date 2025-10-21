'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PowerUpButtonProps {
  type: 'imageRecognition' | 'voiceResponse' | 'fileUpload' | 'webSearch' | 'scheduling' | 'dataExport';
  label: string;
  emoji: string;
  isActive: boolean;
  isEnabled: boolean;
  onActivate: () => Promise<boolean>; // Returns true if successfully activated
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
}

const powerUpStyles = {
  imageRecognition: {
    active: 'bg-purple-600/40 text-purple-200 border-2 border-purple-400',
    inactive: 'bg-purple-600/20 text-purple-300 border border-purple-500/50',
    image: '/powerups/image-recognition.png',
  },
  voiceResponse: {
    active: 'bg-blue-600/40 text-blue-200 border-2 border-blue-400',
    inactive: 'bg-blue-600/20 text-blue-300 border border-blue-500/50',
    image: '/powerups/voice-recognition.png',
  },
  fileUpload: {
    active: 'bg-green-600/40 text-green-200 border-2 border-green-400',
    inactive: 'bg-green-600/20 text-green-300 border border-green-500/50',
    image: '/powerups/file-upload.png',
  },
  webSearch: {
    active: 'bg-cyan-600/40 text-cyan-200 border-2 border-cyan-400',
    inactive: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50',
    image: '/powerups/web-search.png',
  },
  scheduling: {
    active: 'bg-orange-600/40 text-orange-200 border-2 border-orange-400',
    inactive: 'bg-orange-600/20 text-orange-300 border border-orange-500/50',
    image: '/powerups/scheduling.png',
  },
  dataExport: {
    active: 'bg-pink-600/40 text-pink-200 border-2 border-pink-400',
    inactive: 'bg-pink-600/20 text-pink-300 border border-pink-500/50',
    image: '/powerups/data-export.png',
  },
};

export function PowerUpButton({ 
  type, 
  label, 
  emoji, 
  isActive, 
  isEnabled,
  onActivate,
  className 
}: PowerUpButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  const styles = powerUpStyles[type];

  const playPowerUpSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillators for a futuristic power-up sound
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect the audio graph
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure oscillators
      osc1.type = 'sine';
      osc2.type = 'square';
      
      // Rising pitch sequence (power-up effect)
      const now = audioContext.currentTime;
      osc1.frequency.setValueAtTime(200, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      
      osc2.frequency.setValueAtTime(400, now);
      osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
      
      // Volume envelope (fade in and out)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      
      // Start and stop
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
      
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const createParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 50,
        y: 50,
        angle: (i * 30) * (Math.PI / 180),
        velocity: 2 + Math.random() * 2,
      });
    }
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 1000);
  };

  const handleClick = async () => {
    // Allow clicking for demo purposes - make it always work!
    if (isSpinning) return;

    // Play power-up sound
    playPowerUpSound();

    setIsSpinning(true);
    setShowFlash(true);
    createParticles();

    // Flash effect
    setTimeout(() => setShowFlash(false), 300);

    // Attempt to activate the power-up
    await onActivate();

    // Spin continues for animation, then stops
    setTimeout(() => {
      setIsSpinning(false);
    }, 2000); // 2 second spin animation
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          'relative cursor-pointer transition-all duration-300 rounded-xl p-4 flex flex-col items-center gap-3 select-none group bg-gray-800/30 backdrop-blur-sm overflow-visible',
          'hover:scale-110 hover:shadow-2xl hover:bg-gray-800/50',
          isActive && 'ring-2 ring-green-400 bg-gray-800/60 shadow-lg shadow-green-500/20',
          isSpinning && 'scale-115',
          className
        )}
      >
        {/* Flash Effect */}
        {showFlash && (
          <div className="absolute inset-0 bg-white rounded-xl animate-ping opacity-75 pointer-events-none z-50"></div>
        )}

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full pointer-events-none animate-particle"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%)`,
              animation: `particle-burst 0.8s ease-out forwards`,
              '--angle': `${particle.angle}rad`,
              '--velocity': particle.velocity,
            } as any}
          />
        ))}

        {/* Power-up Image - Clean, no overlay */}
        <div
          className={cn(
            'relative w-20 h-20 transition-transform',
            isSpinning && 'power-up-spin',
            isActive && 'drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]'
          )}
        >
          <Image
            src={styles.image}
            alt={label}
            width={80}
            height={80}
            className={cn(
              'object-contain drop-shadow-2xl transition-all duration-300',
              isActive && 'brightness-110'
            )}
          />
          {isActive && (
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Label - Robotic Font */}
        <div className={cn(
          'text-sm font-bold text-center font-orbitron tracking-wider uppercase transition-colors',
          isActive ? 'text-green-400' : 'text-white'
        )}>
          {label}
        </div>

        {/* Static glow when active (no continuous animation) */}
        {isActive && !isSpinning && (
          <div className="absolute inset-0 rounded-xl bg-green-500/5 pointer-events-none"></div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(540deg) scale(1.2);
          }
          70% {
            transform: rotate(1080deg) scale(1.1);
          }
          85% {
            transform: rotate(1060deg) scale(1.05);
          }
          100% {
            transform: rotate(1080deg) scale(1);
          }
        }
        
        @keyframes particle-burst {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) 
              translate(
                calc(cos(var(--angle)) * var(--velocity) * 50px),
                calc(sin(var(--angle)) * var(--velocity) * 50px)
              ) 
              scale(0);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow-ring {
          0% {
            transform: rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.3;
          }
        }
        
        :global(.power-up-spin) {
          animation: spin-slow 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards !important;
        }
        
        :global(.animate-spin-slow-ring) {
          animation: spin-slow-ring 3s linear infinite;
        }
      `}</style>
    </>
  );
}

