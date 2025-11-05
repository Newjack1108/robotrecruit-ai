'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Check, Gift, TrendingUp, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReferralStats {
  total: number;
  pending: number;
  signedUp: number;
  hiredBot: number;
  pointsEarned: number;
  creditsEarned: number;
}

interface ReferralLimits {
  tier: number;
  limit: number;
  remaining: number;
}

interface Referral {
  id: string;
  code: string;
  status: string;
  invitedEmail: string;
  createdAt: string;
  signedUpAt?: string;
  firstBotHiredAt?: string;
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [limits, setLimits] = useState<ReferralLimits | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (open) {
      fetchReferrals();
    }
  }, [open]);

  async function fetchReferrals() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/referrals/my-referrals');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLimits(data.limits);
        setReferrals(data.referrals);
        setBaseUrl(data.baseUrl);
      } else {
        toast.error('Failed to load referrals');
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateNewReferral() {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('New invite link created!');
        await fetchReferrals(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.message || data.error || 'Failed to generate invite link');
      }
    } catch (error) {
      console.error('Failed to generate referral:', error);
      toast.error('Failed to generate invite link');
    } finally {
      setIsGenerating(false);
    }
  }

  function copyToClipboard(code: string) {
    const url = `${baseUrl}/sign-up?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'signed_up':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50"><Users className="w-3 h-3 mr-1" />Signed Up</Badge>;
      case 'bot_hired':
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">{status}</Badge>;
    }
  }

  function getTierName(tier: number) {
    switch (tier) {
      case 1: return 'Free';
      case 2: return 'Pro';
      case 3: return 'Premium';
      default: return 'Unknown';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Invite Friends
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Earn rewards when your friends join and hire their first bot!
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-cyan-400">Total Invites</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-green-400">Points Earned</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.pointsEarned || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-purple-400">Credits Earned</p>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.creditsEarned || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-orange-400">Remaining</p>
                </div>
                <p className="text-2xl font-bold text-white">{limits?.remaining || 0}</p>
              </div>
            </div>

            {/* Tier Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Your Plan: <span className="text-white font-bold">{getTierName(limits?.tier || 1)}</span></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {limits?.tier === 1 && 'Upgrade to Pro or Premium for more invites!'}
                    {limits?.tier === 2 && 'Upgrade to Premium for unlimited invites!'}
                    {limits?.tier === 3 && 'You have unlimited invites!'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{stats?.total || 0}/{limits?.limit === 999999 ? '∞' : limits?.limit}</p>
                  <p className="text-xs text-gray-400">Invites Used</p>
                </div>
              </div>
            </div>

            {/* Rewards Info */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-yellow-400 mb-2">🎁 Reward Breakdown</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <p>✅ Friend signs up: <span className="text-white font-bold">+50 points</span> for you, <span className="text-white font-bold">+25 points & 5 credits</span> for them</p>
                <p>🤖 Friend hires first bot: <span className="text-white font-bold">+50 points & 20 credits</span> for you</p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateNewReferral}
              disabled={isGenerating || (limits?.remaining || 0) <= 0}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Generate New Invite Link
                </>
              )}
            </Button>

            {/* Referrals List */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Your Invites</h3>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No invites yet. Generate your first one above!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono text-cyan-400">{ref.code}</code>
                            {getStatusBadge(ref.status)}
                          </div>
                          <p className="text-xs text-gray-400">{ref.invitedEmail}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Created {new Date(ref.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(ref.code)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {copiedCode === ref.code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

