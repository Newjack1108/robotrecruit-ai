'use client';

import Image from 'next/image';

interface SlotReelProps {
  bots: string[];
  spinning: boolean;
  delay: number;
  isWinner?: boolean;
}

export default function SlotReel({ bots, spinning, delay, isWinner }: SlotReelProps) {
  const centerBot = bots[1]; // Middle bot is the result

  return (
    <div className="relative">
      {/* Reel Container */}
      <div 
        className={`
          relative overflow-hidden rounded-xl
          ${isWinner ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-black' : 'border-4 border-gray-800'}
          ${spinning ? 'blur-sm' : 'blur-0'}
          transition-all duration-300
        `}
        style={{
          height: '200px',
          backgroundColor: '#1a1a1a'
        }}
      >
        {/* Spinning Animation */}
        <div
          className={`
            flex flex-col items-center justify-center
            ${spinning ? 'animate-spin-reel' : ''}
          `}
          style={{
            animationDelay: `${delay}ms`,
            transform: spinning ? 'translateY(-100%)' : 'translateY(0)',
            transition: spinning ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {bots.map((bot, i) => (
            <div
              key={i}
              className={`
                flex items-center justify-center
                ${i === 1 ? 'scale-110' : 'scale-90 opacity-50'}
                transition-all duration-300
              `}
              style={{ height: '200px', width: '100%' }}
            >
              <Image
                src={`/bots/${bot}-avatar.png`}
                alt={bot}
                width={120}
                height={120}
                className={`
                  rounded-full
                  ${i === 1 && isWinner ? 'animate-glow' : ''}
                `}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Winner Glow Effect */}
      {isWinner && !spinning && (
        <>
          <div className="absolute inset-0 bg-yellow-400/20 rounded-xl animate-pulse pointer-events-none" />
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-xl blur-xl opacity-75 animate-pulse pointer-events-none" />
        </>
      )}
    </div>
  );
}

