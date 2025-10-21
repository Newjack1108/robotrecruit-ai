/**
 * Challenge Tracker Utility
 * Helper functions to track progress towards daily challenges
 */

/**
 * Track a challenge action
 * Call this from API routes when users perform challenge-worthy actions
 */
export async function trackChallengeProgress(
  action: string,
  userId: string,
  metadata?: any
): Promise<void> {
  try {
    await fetch('/api/challenges/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        metadata,
      }),
    });
  } catch (error) {
    // Silent fail - don't block user actions if challenge tracking fails
    console.error('[CHALLENGE_TRACKER]', error);
  }
}

/**
 * Client-side challenge tracker
 * Use this in React components to track user actions
 */
export async function trackChallenge(action: string, metadata?: any): Promise<void> {
  try {
    const response = await fetch('/api/challenges/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        metadata,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.completion?.isCompleted) {
        console.log(`[CHALLENGE] Challenge completed! +${data.completion.pointsEarned} points`);
      }
    }
  } catch (error) {
    console.error('[CHALLENGE_TRACKER]', error);
  }
}

