'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';

export function PromoCodeRedeem() {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);
    setMessage(null);

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Success! You've been upgraded to Tier ${data.tierUpgrade} for ${data.durationDays} days! 🎉`,
      });
      setCode('');

      // Refresh the page after 2 seconds to show new tier
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error('Failed to redeem promo code:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to redeem promo code. Please check the code and try again.',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-orbitron font-bold text-white">Have a Promo Code?</h3>
      </div>

      <form onSubmit={handleRedeem} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER-CODE-HERE"
            className="bg-gray-800/80 border-gray-700 text-white font-mono flex-1"
          />
          <Button
            type="submit"
            disabled={isRedeeming || !code}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem'}
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}



