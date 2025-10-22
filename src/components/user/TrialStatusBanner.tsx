'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

interface TrialStatus {
  isFreeUser: boolean;
  isPremium: boolean;
  trial: {
    active: boolean;
    expired: boolean;
    daysLeft: number;
    endsAt: Date | null;
  };
  messages: {
    sent: number;
    limit: number;
    remaining: number;
    unlimited: boolean;
  };
}

export function TrialStatusBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/user/trial-status');
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trialStatus || trialStatus.isPremium || dismissed) {
    return null;
  }

  const { trial, messages } = trialStatus;

  // Don't show banner if trial is active and messages remaining > 3
  if (trial.active && messages.remaining > 3 && trial.daysLeft > 2) {
    return null;
  }

  // Determine banner style based on urgency
  const isUrgent = trial.daysLeft <= 1 || messages.remaining <= 2;
  const isCritical = trial.expired || messages.remaining === 0;

  const bgColor = isCritical 
    ? 'bg-red-900/20 border-red-500/30' 
    : isUrgent 
    ? 'bg-orange-900/20 border-orange-500/30'
    : 'bg-blue-900/20 border-blue-500/30';

  const textColor = isCritical 
    ? 'text-red-400' 
    : isUrgent 
    ? 'text-orange-400'
    : 'text-blue-400';

  const iconColor = isCritical 
    ? 'text-red-500' 
    : isUrgent 
    ? 'text-orange-500'
    : 'text-blue-500';

  return (
    <div className={`relative border ${bgColor} rounded-lg p-4 mb-6 backdrop-blur-sm`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <AlertCircle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            {trial.active && (
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>
                  Trial: {trial.daysLeft} day{trial.daysLeft !== 1 ? 's' : ''} left
                </span>
              </div>
            )}
            
            {trial.expired && (
              <span className="text-sm font-semibold text-red-400">
                Free trial expired
              </span>
            )}

            {!messages.unlimited && (
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-4 h-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>
                  {messages.remaining} message{messages.remaining !== 1 ? 's' : ''} remaining today
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-300 text-sm">
            {trial.expired 
              ? 'Subscribe now to continue chatting with unlimited bots and messages.'
              : messages.remaining <= 2
              ? 'You\'re almost out of free messages today. Upgrade for unlimited messaging!'
              : 'Upgrade to unlock unlimited messages, premium bots, and exclusive features.'
            }
          </p>

          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-medium text-sm"
          >
            View Plans & Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}

