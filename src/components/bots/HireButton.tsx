'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HireButtonProps {
  botId: string;
  botName: string;
  isHired: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

export function HireButton({ botId, botName, isHired, isDisabled, disabledReason }: HireButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleHire = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bots/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to hire bot');
        return;
      }

      alert(`✅ ${botName} has joined your team! ${data.remaining} positions remaining.`);
      router.refresh();
    } catch (error) {
      console.error('Error hiring bot:', error);
      alert('Failed to recruit bot');
    } finally {
      setLoading(false);
    }
  };

  const handleFire = async () => {
    if (!confirm(`🔥 Are you sure you want to fire ${botName}?\n\nThey'll be removed from your team, but you can recruit them again later.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bots/hire', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to remove bot');
        return;
      }

      alert(`📤 ${botName} has been fired and removed from your roster`);
      router.refresh();
    } catch (error) {
      console.error('Error firing bot:', error);
      alert('Failed to remove bot');
    } finally {
      setLoading(false);
    }
  };

  if (isHired) {
    return (
      <Button
        onClick={handleFire}
        disabled={loading}
        variant="ghost"
        className="relative group/del bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 px-4 py-6"
        title="Fire this bot"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleHire}
      disabled={loading || isDisabled}
      className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white font-bold font-orbitron tracking-wide py-6 text-base shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
      title={isDisabled ? disabledReason : undefined}
    >
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            RECRUITING...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5 mr-2" />
            {isDisabled ? '🔒 PAYROLL FULL' : '⚡ RECRUIT NOW'}
          </>
        )}
      </span>
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
      )}
    </Button>
  );
}

