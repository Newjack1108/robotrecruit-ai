'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (referralCode) {
      validateReferralCode(referralCode);
    }
  }, [referralCode]);

  async function validateReferralCode(code: string) {
    try {
      setIsValidating(true);
      const response = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        setReferralInfo(data);
        // Store in localStorage for use after sign-up
        localStorage.setItem('pendingReferralCode', code);
      }
    } catch (error) {
      console.error('Failed to validate referral code:', error);
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        {/* Referral Banner */}
        {referralCode && (
          <div className="mb-4">
            {isValidating ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                <p className="text-sm text-blue-800">Validating invite code...</p>
              </div>
            ) : referralInfo?.valid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800 mb-1">You've been invited! 🎉</p>
                    <p className="text-xs text-green-700">
                      {referralInfo.message}
                    </p>
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Sign up to get <span className="font-bold">25 bonus points + 5 power-up credits</span>!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">Invalid or expired invite code.</p>
              </div>
            )}
          </div>
        )}

        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          fallbackRedirectUrl="/chat"
          signInUrl="/sign-in"
        />
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
          <p className="text-xs">
            <Link href="/disclaimer" className="text-gray-500 hover:text-gray-700 hover:underline">Disclaimer</Link>
            {' • '}
            <Link href="/cookies" className="text-gray-500 hover:text-gray-700 hover:underline">Cookie Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
