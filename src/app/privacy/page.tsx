import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy | Robot Recruit AI',
  description: 'Our commitment to protecting your privacy and data',
};

export default function PrivacyPage() {
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
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-orbitron">Privacy Policy</h1>
            <p className="text-gray-400">Last Updated: 17 October 2024</p>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="prose prose-invert max-w-none p-8 space-y-6">
            {/* Same content as the dashboard version */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300">
                Robot Recruit AI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered bot recruitment and management platform (the "Service"). This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <p className="text-gray-300 mt-4">
                <strong>Data Controller:</strong> Robot Recruit AI<br />
                <strong>Contact:</strong> [Your Company Address]<br />
                <strong>Email:</strong> privacy@robotrecruitai.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.1 Personal Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
                <li><strong>Profile Information:</strong> Optional profile details, preferences, and settings</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
                <li><strong>Communication Data:</strong> Support tickets, forum posts, and messages</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">2.2 Information Collected Through AI Interactions</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Conversation Data:</strong> Messages exchanged with AI bots, including text and uploaded files</li>
                <li><strong>Training Data:</strong> Files and documents you upload to train custom AI bots</li>
                <li><strong>Voice Data:</strong> Audio recordings if you use voice input features (processed and not stored)</li>
                <li><strong>Image Data:</strong> Images uploaded for analysis by AI bots</li>
                <li><strong>Usage Patterns:</strong> How you interact with AI bots, features used, and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Cookies:</strong> Session management and analytics (see Cookie Policy below)</li>
              </ul>
            </section>

            {/* Continue with all other sections from the dashboard version... */}
            <section className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Read Full Policy</h3>
              <p className="text-gray-300">
                This page contains an abbreviated version of our Privacy Policy. For complete details on all sections including data usage, retention, your rights under UK GDPR, AI processing, security measures, and contact information, please{' '}
                <Link href="/privacy-full" className="text-cyan-400 hover:underline font-semibold">
                  read the full Privacy Policy
                </Link>
                .
              </p>
              <p className="text-gray-300 mt-4">
                Key topics covered in the full policy include:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-1 mt-2">
                <li>How we use your information</li>
                <li>OpenAI and third-party service integration</li>
                <li>Data retention periods</li>
                <li>Your UK GDPR rights (access, erasure, portability, etc.)</li>
                <li>Data security measures</li>
                <li>International data transfers</li>
                <li>AI-specific privacy considerations</li>
                <li>Contact information and how to exercise your rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
                <p className="text-gray-300"><strong>Email:</strong> <a href="mailto:privacy@robotrecruitai.com" className="text-cyan-400 hover:underline">privacy@robotrecruitai.com</a></p>
                <p className="text-gray-300 mt-2"><strong>Support:</strong> Create a ticket through the platform</p>
                <p className="text-gray-300 mt-2"><strong>Address:</strong> [Your Company Address, UK]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

