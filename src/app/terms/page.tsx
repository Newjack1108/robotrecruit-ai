import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Robot Recruit AI',
  description: 'Terms of Service for Robot Recruit AI platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/85"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-gray-900/50 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-gray-300 hover:text-white font-orbitron gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Scale className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-orbitron">Terms & Conditions</h1>
            <p className="text-gray-400">Last Updated: 17 October 2024</p>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="prose prose-invert max-w-none p-8 space-y-6">
            {/* Abbreviated version */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-300">
                These Terms and Conditions ("Terms") constitute a legally binding agreement between you and Robot Recruit AI governing your access to and use of our AI bot platform.
              </p>
              <p className="text-gray-300 mt-4">
                <strong>By accessing or using the Service, you agree to be bound by these Terms.</strong> If you disagree with any part, you must not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. AI Limitations and Disclaimers</h2>
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 my-4">
                <p className="text-yellow-200 font-semibold mb-3">IMPORTANT: AI-Generated Content Disclaimer</p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li><strong>No Guarantee of Accuracy:</strong> AI-generated responses may contain errors or inaccuracies</li>
                  <li><strong>Not Professional Advice:</strong> AI responses do not constitute professional medical, legal, or financial advice</li>
                  <li><strong>No Human Review:</strong> Responses are generated automatically without human verification</li>
                  <li><strong>User Responsibility:</strong> You are solely responsible for verifying AI-generated information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Acceptable Use</h2>
              <p className="text-gray-300 mb-3">You agree NOT to use the Service to:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Generate, distribute, or promote illegal content</li>
                <li>Harass, threaten, or harm others</li>
                <li>Infringe intellectual property rights</li>
                <li>Attempt to circumvent security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 my-4">
                <p className="text-red-200 font-semibold mb-3">IMPORTANT LEGAL DISCLAIMER</p>
                <p className="text-gray-300">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We are not liable for decisions made based on AI-generated content. Our total liability shall not exceed the amount you paid in the 12 months preceding any claim.
                </p>
              </div>
            </section>

            <section className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold text-purple-400 mb-3">Read Full Terms</h3>
              <p className="text-gray-300">
                This page contains key highlights from our Terms & Conditions. For complete legal details covering all aspects of service use, please{' '}
                <Link href="/terms-full" className="text-purple-400 hover:underline font-semibold">
                  read the full Terms & Conditions
                </Link>
                .
              </p>
              <p className="text-gray-300 mt-4">
                Additional topics covered in the full terms include:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-1 mt-2">
                <li>Account registration and security requirements</li>
                <li>Detailed service description and AI functionality</li>
                <li>Subscription plans, billing, and refunds</li>
                <li>Complete acceptable use policy</li>
                <li>Intellectual property rights</li>
                <li>Data protection and privacy</li>
                <li>Service modifications and termination</li>
                <li>Dispute resolution and governing law</li>
                <li>Contact information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
                <p className="text-gray-300"><strong>Email:</strong> <a href="mailto:legal@robotrecruitai.com" className="text-purple-400 hover:underline">legal@robotrecruitai.com</a></p>
                <p className="text-gray-300 mt-2"><strong>Support:</strong> <a href="mailto:support@robotrecruitai.com" className="text-purple-400 hover:underline">support@robotrecruitai.com</a></p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

