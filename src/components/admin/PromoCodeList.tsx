'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  tierUpgrade: number;
  durationDays: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  _count: {
    redemptions: number;
  };
}

interface PromoCodeListProps {
  promoCodes: PromoCode[];
}

export function PromoCodeList({ promoCodes }: PromoCodeListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle promo code:', error);
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    
    try {
      await fetch(`/api/admin/promo-codes?id=${id}`, {
        method: 'DELETE',
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete promo code:', error);
    }
  };

  const getTierBadge = (tier: number) => {
    const badges = {
      2: { name: 'Pro', color: 'bg-blue-600/80 text-blue-100' },
      3: { name: 'Premium', color: 'bg-purple-600/80 text-purple-100' },
    };
    return badges[tier as keyof typeof badges] || { name: 'Free', color: 'bg-gray-600/80 text-gray-100' };
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
      <h3 className="text-xl font-orbitron font-bold text-white mb-4">Active Promo Codes</h3>
      
      <div className="space-y-3">
        {promoCodes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No promo codes created yet</p>
        ) : (
          promoCodes.map((promo) => {
            const tierBadge = getTierBadge(promo.tierUpgrade);
            const expired = isExpired(promo.expiresAt);
            
            return (
              <div
                key={promo.id}
                className={`border rounded-lg p-4 ${
                  promo.isActive && !expired
                    ? 'border-gray-700/50 bg-gray-800/30'
                    : 'border-gray-800/50 bg-gray-900/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <code className="text-lg font-mono font-bold text-cyan-400">{promo.code}</code>
                    <button
                      onClick={() => copyToClipboard(promo.code, promo.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedId === promo.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(promo.id, promo.isActive)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title={promo.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {promo.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCode(promo.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tier:</span>
                    <div className={`inline-block ml-2 px-2 py-0.5 rounded text-xs ${tierBadge.color}`}>
                      {tierBadge.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-white ml-2">{promo.durationDays}d</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Uses:</span>
                    <span className="text-white ml-2">
                      {promo._count.redemptions}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ' / ∞'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 ${
                      expired ? 'text-red-400' : 
                      promo.isActive ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {expired ? 'Expired' : promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {promo.expiresAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Code expires: {new Date(promo.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}



