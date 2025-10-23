'use client';

import { Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ClickableVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function ClickableVideo({ src, poster, className = '' }: ClickableVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handleError = (e: Event) => {
      console.error('Boss video error:', e);
      setHasError(true);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const handleClick = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(err => {
        console.error('Failed to play video:', err);
        setHasError(true);
      });
      videoRef.current.controls = true;
      setIsPlaying(true);
    }
  };

  if (hasError) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
          <p className="text-gray-400">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        className="w-full aspect-square object-cover"
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
        <source src="/video/boss-intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-all pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-cyan-500/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}

