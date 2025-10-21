import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-7xl md:text-8xl'
  };

  return (
    <div className={`${className}`}>
      <h1 
        className={`${sizeClasses[size]} font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500 relative`}
        style={{
          WebkitTextStroke: '1px rgba(200, 200, 200, 0.6)',
          WebkitTextFillColor: 'transparent',
          textShadow: `
            0 0 4px rgba(200, 200, 200, 0.2),
            0 0 8px rgba(200, 200, 200, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05)
          `,
          filter: 'drop-shadow(0 0 2px rgba(200, 200, 200, 0.1))'
        }}
      >
        RobotRecruit
        <span className="text-[0.8em] ml-1">.AI</span>
      </h1>
    </div>
  );
}
