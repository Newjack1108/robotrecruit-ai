'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function ManualCreditForm() {
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/manual-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          credits: parseInt(credits),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to credit account');
      }

      setResult(data);
      setEmail('');
      setCredits('10');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            User Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <label htmlFor="credits" className="block text-sm font-medium text-gray-300 mb-2">
            Credits to Add
          </label>
          <Input
            id="credits"
            type="number"
            min="1"
            max="1000"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            required
            className="bg-gray-900 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Common amounts: 10 (£3.99), 25 (£7.99), 60 (£14.99), 120 (£24.99)
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            '💳 Add Credits'
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-semibold mb-2">✅ {result.message}</p>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Previous Allowance: {result.oldAllowance}</p>
            <p>New Allowance: {result.newAllowance}</p>
            <p>Remaining Credits: {result.remaining}</p>
          </div>
        </div>
      )}
    </div>
  );
}

