'use client';

import { useEffect, useRef } from 'react';

/**
 * Client component that processes referral code after user signs up
 * This runs once when the dashboard loads for a new user
 */
export function ReferralProcessor() {
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const referralCode = localStorage.getItem('pendingReferralCode');
    if (referralCode) {
      hasProcessed.current = true;
      processReferral(referralCode);
    }
  }, []);

  async function processReferral(code: string) {
    try {
      const response = await fetch('/api/referrals/process-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code }),
      });

      if (response.ok) {
        // Remove the code from localStorage
        localStorage.removeItem('pendingReferralCode');
        console.log('[REFERRAL] Successfully processed referral code');
      }
    } catch (error) {
      console.error('[REFERRAL] Failed to process referral:', error);
    }
  }

  return null; // This component doesn't render anything
}

