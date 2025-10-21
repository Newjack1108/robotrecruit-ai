'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink,
  Webhook,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface StripeSettingsFormProps {
  currentProPriceId: string;
  currentPremiumPriceId: string;
  currentPublishableKey: string;
  webhookSecret: string;
}

export function StripeSettingsForm({
  currentProPriceId,
  currentPremiumPriceId,
  currentPublishableKey,
  webhookSecret,
}: StripeSettingsFormProps) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const testStripeConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch('/api/admin/stripe/test-connection');
      if (response.ok) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTimeout(() => setTestStatus('idle'), 3000);
      }
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret) return 'Not set';
    if (showSecrets) return secret;
    return secret.substring(0, 8) + '••••••••••••••••' + secret.substring(secret.length - 4);
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/stripe`
    : 'https://your-domain.com/api/webhooks/stripe';

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="w-5 h-5 text-cyan-400" />
            Stripe API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Publishable Key (Public)</Label>
            <div className="flex gap-2">
              <Input
                value={maskSecret(currentPublishableKey)}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(currentPublishableKey, 'publishable')}
                className="flex-shrink-0"
              >
                {copied === 'publishable' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex-shrink-0"
              >
                {showSecrets ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Env var: <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Secret Key (Private)</Label>
            <div className="flex gap-2">
              <Input
                value={showSecrets ? 'sk_••••••••••••••••' : '••••••••••••••••'}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                disabled
                className="flex-shrink-0"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Env var: <code className="bg-black/30 px-1 rounded">STRIPE_SECRET_KEY</code> (Server-only, not displayed)
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={testStripeConnection}
              disabled={testStatus === 'testing'}
              className={`w-full ${
                testStatus === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : testStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {testStatus === 'testing' && 'Testing Connection...'}
              {testStatus === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Connection Successful!
                </>
              )}
              {testStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Connection Failed
                </>
              )}
              {testStatus === 'idle' && 'Test Stripe Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price IDs Section */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-blue-400" />
            Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pro Plan */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              Pro Plan Price ID
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">£9.99/month</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={maskSecret(currentProPriceId)}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(currentProPriceId, 'pro')}
                className="flex-shrink-0"
              >
                {copied === 'pro' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Env var: <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_STRIPE_PRO_PRICE_ID</code>
            </p>
          </div>

          {/* Premium Plan */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              Premium Plan Price ID
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">£19.99/month</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={maskSecret(currentPremiumPriceId)}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(currentPremiumPriceId, 'premium')}
                className="flex-shrink-0"
              >
                {copied === 'premium' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Env var: <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID</code>
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Products in Stripe Dashboard
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="w-5 h-5 text-purple-400" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Webhook Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(webhookUrl, 'webhook-url')}
                className="flex-shrink-0"
              >
                {copied === 'webhook-url' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Add this URL to your Stripe webhook endpoints
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Webhook Signing Secret</Label>
            <div className="flex gap-2">
              <Input
                value={maskSecret(webhookSecret)}
                readOnly
                className="bg-gray-900/50 border-gray-700 text-gray-300 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(webhookSecret, 'webhook-secret')}
                className="flex-shrink-0"
              >
                {copied === 'webhook-secret' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Env var: <code className="bg-black/30 px-1 rounded">STRIPE_WEBHOOK_SECRET</code>
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Webhook Events to Listen For
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'checkout.session.completed',
                'customer.subscription.updated',
                'customer.subscription.deleted',
                'invoice.payment_succeeded',
                'invoice.payment_failed',
              ].map((event) => (
                <div key={event} className="bg-blue-900/30 px-2 py-1 rounded font-mono text-blue-300">
                  {event}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <a
              href="https://dashboard.stripe.com/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Configure Webhooks in Stripe
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border-cyan-700/30">
        <CardHeader>
          <CardTitle className="text-white">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">1. Create Stripe Products</h4>
            <p>Go to Stripe Dashboard → Products → Create products for "Pro" and "Premium" plans with recurring pricing</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">2. Get Price IDs</h4>
            <p>Copy the Price IDs from each product (starts with <code className="bg-black/30 px-1 rounded">price_</code>)</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">3. Update Environment Variables</h4>
            <p>Add these to your <code className="bg-black/30 px-1 rounded">.env.local</code> file:</p>
            <pre className="bg-black/50 p-3 rounded overflow-x-auto text-xs">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">4. Set Up Webhook</h4>
            <p>In Stripe Dashboard → Webhooks → Add endpoint with the URL above and select the events listed</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">5. Restart Server</h4>
            <p>Restart your development server to load the new environment variables</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

