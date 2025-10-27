'use client';

import { useEffect, useState } from 'react';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'star' | 'square';
}

interface ParticleSystemProps {
  particles: Particle[];
  onParticleEnd: (id: string) => void;
}

export function ParticleSystem({ particles, onParticleEnd }: ParticleSystemProps) {
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      particles.forEach(particle => {
        if (particle.life <= 0) {
          onParticleEnd(particle.id);
        }
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [particles, onParticleEnd]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        const scale = 0.5 + (particle.life / particle.maxLife) * 0.5;

        return (
          <div
            key={particle.id}
            className="absolute transition-opacity"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${(1 - opacity) * 360}deg)`,
              borderRadius: particle.type === 'circle' ? '50%' : particle.type === 'star' ? '0%' : '0%',
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Create explosion particles
 */
export function createExplosion(x: number, y: number, color: string, count: number = 12): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 2;
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 6 + Math.random() * 4,
      life: 60,
      maxLife: 60,
      type: 'circle',
    });
  }
  
  return particles;
}

/**
 * Create sparkle particles
 */
export function createSparkles(x: number, y: number, count: number = 8): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FFE4B5'];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    
    particles.push({
      id: `sparkle-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // Slight upward bias
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 3,
      life: 40,
      maxLife: 40,
      type: 'star',
    });
  }
  
  return particles;
}

/**
 * Create trail particle
 */
export function createTrailParticle(x: number, y: number, color: string): Particle {
  return {
    id: `trail-${Date.now()}-${Math.random()}`,
    x,
    y,
    vx: 0,
    vy: 0,
    color,
    size: 8,
    life: 20,
    maxLife: 20,
    type: 'circle',
  };
}

/**
 * Update particles (call this in animation loop)
 */
export function updateParticles(particles: Particle[], deltaTime: number = 16): Particle[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.1, // Gravity
      life: particle.life - deltaTime,
    }))
    .filter(particle => particle.life > 0);
}

