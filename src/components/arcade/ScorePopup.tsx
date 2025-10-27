'use client';

import { useEffect, useState } from 'react';

export interface ScorePopupData {
  id: string;
  x: number;
  y: number;
  points: number;
  type: 'task' | 'powerup' | 'bug' | 'combo';
  comboMultiplier?: number;
}

interface ScorePopupProps {
  popups: ScorePopupData[];
  onPopupEnd: (id: string) => void;
}

export function ScorePopup({ popups, onPopupEnd }: ScorePopupProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 101 }}>
      {popups.map(popup => (
        <AnimatedScore key={popup.id} popup={popup} onEnd={() => onPopupEnd(popup.id)} />
      ))}
    </div>
  );
}

function AnimatedScore({ popup, onEnd }: { popup: ScorePopupData; onEnd: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = popup.type === 'combo' ? 1500 : 1000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(interval);
        onEnd();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [popup.id, popup.type, onEnd]);

  // Animation based on type
  let y, scale, opacity;
  
  if (popup.type === 'bug') {
    // Explode outward
    y = popup.y - progress * 60;
    scale = 1 + progress * 0.5;
    opacity = 1 - progress;
  } else if (popup.type === 'powerup') {
    // Bounce up
    const bounce = Math.sin(progress * Math.PI);
    y = popup.y - progress * 40 - bounce * 20;
    scale = 1 + bounce * 0.3;
    opacity = 1 - progress;
  } else if (popup.type === 'combo') {
    // Pulse and fade
    const pulse = Math.sin(progress * Math.PI * 2) * 0.2;
    y = popup.y - progress * 30;
    scale = 1.5 + pulse;
    opacity = 1 - progress;
  } else {
    // Default: fade up
    y = popup.y - progress * 50;
    scale = 1;
    opacity = 1 - progress;
  }

  const getColor = () => {
    switch (popup.type) {
      case 'task':
        return 'text-cyan-400';
      case 'powerup':
        return 'text-yellow-400';
      case 'bug':
        return 'text-purple-400';
      case 'combo':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  const getText = () => {
    if (popup.type === 'combo' && popup.comboMultiplier) {
      return `${popup.comboMultiplier}x COMBO!`;
    }
    return `+${popup.points}`;
  };

  return (
    <div
      className={`absolute font-bold ${getColor()} pointer-events-none`}
      style={{
        left: `${popup.x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        fontSize: popup.type === 'combo' ? '24px' : '18px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        fontFamily: 'monospace',
      }}
    >
      {getText()}
    </div>
  );
}

