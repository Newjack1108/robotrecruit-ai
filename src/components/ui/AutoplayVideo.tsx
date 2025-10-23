'use client';

import { useRef, useEffect, useState } from 'react';

interface AutoplayVideoProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  className?: string;
}

export function AutoplayVideo({ src, fallbackSrc, poster, className = '' }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log('Header video ready to play');
    };

    const handleError = (e: Event) => {
      console.error('Header video error:', e);
      setHasError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Try to play the video
    video.play().catch(err => {
      console.log('Autoplay blocked, video will play when visible:', err);
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Loading video...</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
      {fallbackSrc && <source src={fallbackSrc} type="video/mp4" />}
      Your browser does not support the video tag.
    </video>
  );
}

