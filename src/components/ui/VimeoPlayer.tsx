'use client';

import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface VimeoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  background?: boolean;
  className?: string;
  containerClassName?: string;
  title?: string;
  showPlayButton?: boolean;
}

export function VimeoPlayer({
  videoId,
  autoplay = false,
  muted = true,
  loop = false,
  background = false,
  className = '',
  containerClassName = '',
  title = 'Video',
  showPlayButton = false,
}: VimeoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasInteracted, setHasInteracted] = useState(autoplay);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build Vimeo URL with proper parameters
  const getVimeoUrl = () => {
    const params = new URLSearchParams({
      badge: '0',
      autopause: '0',
      // Background videos should always autoplay
      autoplay: (background || autoplay) ? '1' : '0',
      loop: loop ? '1' : '0',
      muted: muted ? '1' : '0',
      player_id: '0',
      app_id: '58479',
      playsinline: '1', // Critical for iOS
    });

    if (background) {
      params.append('background', '1');
    }

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  };

  const handlePlayClick = () => {
    setHasInteracted(true);
    setIsPlaying(true);
    
    // Send play command to iframe
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src.replace('autoplay=0', 'autoplay=1');
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <iframe
        ref={iframeRef}
        src={getVimeoUrl()}
        className={className}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        title={title}
      />
      
      {/* Play Button Overlay for mobile/manual play */}
      {showPlayButton && !isPlaying && !hasInteracted && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group transition-all hover:bg-black/50"
          onClick={handlePlayClick}
        >
          <div className="bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-full p-6 transform transition-all group-hover:scale-110 shadow-2xl">
            <Play className="w-12 h-12" fill="white" />
          </div>
        </div>
      )}
    </div>
  );
}

