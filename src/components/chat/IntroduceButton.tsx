'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntroduceButtonProps {
  audioUrl?: string | null;
  botName: string;
}

export function IntroduceButton({ audioUrl, botName }: IntroduceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('canplaythrough', () => {
        setAudioReady(true);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setAudioReady(false);
      });

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!audioUrl) return null;

  return (
    <Button
      onClick={togglePlay}
      variant="outline"
      size="lg"
      disabled={!audioReady}
      className={cn(
        'relative overflow-hidden group/intro transition-all duration-300',
        isPlaying
          ? 'bg-blue-600/30 border-blue-400 text-blue-200 scale-105 shadow-lg shadow-blue-500/50'
          : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:border-cyan-400'
      )}
    >
      <span className="relative z-10 flex items-center justify-center font-orbitron font-bold tracking-wide">
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 mr-2" />
            STOP
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 mr-2" />
            INTRODUCE YOURSELF
          </>
        )}
      </span>

      {/* Waveform Animation when playing */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 flex gap-0.5 items-end justify-center px-2 pb-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-400 rounded-t animate-waveform"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      )}

      {!isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/intro:translate-x-[100%] transition-transform duration-700"></div>
      )}

      <style jsx>{`
        @keyframes waveform {
          0%, 100% {
            height: 2px;
          }
          50% {
            height: 12px;
          }
        }
        
        :global(.animate-waveform) {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </Button>
  );
}

