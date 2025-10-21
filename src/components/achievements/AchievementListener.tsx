'use client';

import { useState, useEffect } from 'react';
import { AchievementUnlockModal } from './AchievementUnlockModal';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 1 | 2 | 3;
  points: number;
}

export function AchievementListener() {
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Check for new achievements every 10 seconds
    const interval = setInterval(checkForNewAchievements, 10000);
    
    return () => clearInterval(interval);
  }, [lastChecked]);

  async function checkForNewAchievements() {
    try {
      const response = await fetch('/api/user/stats');
      if (!response.ok) {
        // Silently fail if API isn't ready yet (e.g., during dev server restart)
        console.debug('Achievement check skipped - API not ready');
        return;
      }

      const data = await response.json();
      
      // Safety check in case data structure isn't ready
      if (!data?.unlockedAchievements) {
        console.debug('Achievement check skipped - data structure not ready');
        return;
      }
      
      // Find achievements unlocked since last check
      const recentlyUnlocked = data.unlockedAchievements.filter((ua: any) => {
        const unlockedAt = new Date(ua.unlockedAt);
        return unlockedAt > lastChecked;
      });

      if (recentlyUnlocked.length > 0) {
        // Show the most recent one
        const latest = recentlyUnlocked[0];
        setUnlockedAchievement(latest.achievement);
        setLastChecked(new Date());
      }
    } catch (error) {
      // Silently handle errors during development
      console.debug('Achievement check error (this is normal during dev):', error);
    }
  }

  if (!unlockedAchievement) return null;

  return (
    <AchievementUnlockModal
      achievement={unlockedAchievement}
      onClose={() => setUnlockedAchievement(null)}
    />
  );
}

