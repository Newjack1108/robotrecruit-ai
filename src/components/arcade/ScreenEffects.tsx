'use client';

import { useEffect, useState } from 'react';

interface ScreenEffectsProps {
  shake?: boolean;
  flash?: { color: string; duration: number } | null;
  countdown?: number | null;
}

export function ScreenEffects({ shake, flash, countdown }: ScreenEffectsProps) {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [flashOpacity, setFlashOpacity] = useState(0);

  // Handle screen shake
  useEffect(() => {
    if (!shake) {
      setShakeOffset({ x: 0, y: 0 });
      return;
    }

    const shakeInterval = setInterval(() => {
      setShakeOffset({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      });
    }, 50);

    const shakeTimeout = setTimeout(() => {
      setShakeOffset({ x: 0, y: 0 });
      clearInterval(shakeInterval);
    }, 200);

    return () => {
      clearInterval(shakeInterval);
      clearTimeout(shakeTimeout);
    };
  }, [shake]);

  // Handle screen flash
  useEffect(() => {
    if (!flash) {
      setFlashOpacity(0);
      return;
    }

    setFlashOpacity(0.6);
    const timeout = setTimeout(() => {
      setFlashOpacity(0);
    }, flash.duration);

    return () => clearTimeout(timeout);
  }, [flash]);

  return (
    <>
      {/* Screen shake wrapper effect (applied via CSS transform on parent) */}
      <style jsx>{`
        .game-container {
          transform: translate(${shakeOffset.x}px, ${shakeOffset.y}px);
        }
      `}</style>

      {/* Flash overlay */}
      {flashOpacity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundColor: flash?.color || 'white',
            opacity: flashOpacity,
            zIndex: 200,
          }}
        />
      )}

      {/* Countdown overlay */}
      {countdown !== null && countdown !== undefined && countdown > 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 201 }}>
          <div className="text-9xl font-black text-white animate-pulse" style={{ textShadow: '0 0 30px cyan, 4px 4px 8px black' }}>
            {countdown}
          </div>
        </div>
      )}

      {/* GO! text */}
      {countdown === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none animate-scale-out" style={{ zIndex: 201 }}>
          <div className="text-9xl font-black text-cyan-400" style={{ textShadow: '0 0 30px cyan, 4px 4px 8px black' }}>
            GO!
          </div>
        </div>
      )}
    </>
  );
}

// Add CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scale-out {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    .animate-scale-out {
      animation: scale-out 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

