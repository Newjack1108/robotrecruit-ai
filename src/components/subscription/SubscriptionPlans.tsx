'use client';

import { useState } from 'react';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { STRIPE_PLANS } from '@/lib/stripe-config';

interface SubscriptionPlansProps {
  currentTier: number;
  hasActiveSubscription: boolean;
  stripeCustomerId: string | null;
}

export function SubscriptionPlans({ 
  currentTier, 
  hasActiveSubscription,
  stripeCustomerId 
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'pro' | 'premium') => {
    try {
      setLoading(plan);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('[SUBSCRIBE_ERROR]', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading('portal');

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('[PORTAL_ERROR]', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(null);
    }
  };

  const tiers = [
    {
      id: 1,
      name: 'Free',
      price: '£0',
      priceValue: 0,
      description: 'Get started with basic bots',
      features: [
        'Access to Boss Bot',
        'Hire up to 2 specialist bots',
        '5 FREE power-up credits to try features',
        '10 messages per day limit',
        'Basic conversation features',
        'Community support',
      ],
      buttonText: 'Current Plan',
      icon: Sparkles,
    },
    {
      id: 2,
      name: 'Pro',
      price: '£7.99',
      priceValue: 7.99,
      description: 'Perfect for professionals',
      features: STRIPE_PLANS.pro.features,
      buttonText: 'Upgrade to Pro',
      popular: true,
      icon: Crown,
      stripePlan: 'pro' as const,
    },
    {
      id: 3,
      name: 'Premium',
      price: '£16.99',
      priceValue: 16.99,
      description: 'Ultimate power and flexibility',
      features: STRIPE_PLANS.premium.features,
      buttonText: 'Upgrade to Premium',
      icon: Crown,
      stripePlan: 'premium' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Manage Subscription Button (if user has active subscription) */}
      {hasActiveSubscription && stripeCustomerId && (
        <div className="flex justify-center">
          <Button
            onClick={handleManageSubscription}
            disabled={loading === 'portal'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-orbitron"
          >
            {loading === 'portal' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Manage Subscription
              </>
            )}
          </Button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const isCurrentTier = currentTier === tier.id;
          const Icon = tier.icon;

          return (
            <Card 
              key={tier.id}
              className={`relative bg-gray-900/50 border-gray-800 ${
                tier.popular 
                  ? 'border-cyan-500 border-2 shadow-xl shadow-cyan-500/20' 
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold font-orbitron shadow-lg">
                    ⭐ MOST POPULAR
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    tier.popular ? 'bg-cyan-500/20' : 'bg-gray-800/50'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      tier.popular ? 'text-cyan-400' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-orbitron text-white">
                  {tier.name}
                </CardTitle>
                
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.id > 1 && (
                    <span className="text-gray-400 ml-2">/month</span>
                  )}
                </div>
                
                <CardDescription className="mt-2 text-gray-400">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentTier ? (
                  <Button 
                    className="w-full bg-gray-800 text-gray-400 cursor-not-allowed font-orbitron" 
                    disabled
                  >
                    ✓ Current Plan
                  </Button>
                ) : tier.id === 1 ? (
                  <Button 
                    className="w-full bg-gray-800 text-gray-400 font-orbitron" 
                    variant="outline"
                    disabled
                  >
                    Free Forever
                  </Button>
                ) : (
                  <Button 
                    className={`w-full font-orbitron font-bold ${
                      tier.popular
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={() => handleSubscribe(tier.stripePlan!)}
                    disabled={!!loading}
                  >
                    {loading === tier.stripePlan ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        🚀 {tier.buttonText}
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Instant Access</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Powered by Stripe • All payments are secure and encrypted
        </p>
      </div>
    </div>
  );
}

