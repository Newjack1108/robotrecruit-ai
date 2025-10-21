'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export function PromoCodeForm() {
  const [code, setCode] = useState('');
  const [tierUpgrade, setTierUpgrade] = useState('2');
  const [durationDays, setDurationDays] = useState('30');
  const [maxUses, setMaxUses] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i !== 11) result += '-';
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          tierUpgrade: parseInt(tierUpgrade),
          durationDays: parseInt(durationDays),
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setMessage({ type: 'success', text: 'Promo code created successfully!' });
      setCode('');
      setMaxUses('');
      setExpiresInDays('');
      
      // Refresh the page to show new code
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Failed to create promo code:', error);
      setMessage({ type: 'error', text: 'Failed to create promo code. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
      <h3 className="text-xl font-orbitron font-bold text-white mb-4">Create Promo Code</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Code *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PROMO-CODE-HERE"
              required
              className="bg-gray-800/80 border-gray-700 text-white font-mono flex-1"
            />
            <Button
              type="button"
              onClick={generateCode}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Generate
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tier Upgrade *
          </label>
          <select
            value={tierUpgrade}
            onChange={(e) => setTierUpgrade(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-700 rounded-md px-3 py-2 text-white"
            required
          >
            <option value="2">Pro (Tier 2)</option>
            <option value="3">Premium (Tier 3)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration (Days) *
          </label>
          <Input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="30"
            min="1"
            required
            className="bg-gray-800/80 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Uses (Optional)
          </label>
          <Input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
            min="1"
            className="bg-gray-800/80 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Code Expires In (Days, Optional)
          </label>
          <Input
            type="number"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            placeholder="Never expires"
            min="1"
            className="bg-gray-800/80 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">When the code itself becomes invalid</p>
        </div>

        <Button
          type="submit"
          disabled={isCreating || !code}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
        >
          {isCreating ? (
            'Creating...'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Promo Code
            </>
          )}
        </Button>

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



