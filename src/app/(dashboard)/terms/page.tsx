import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Robot Recruit AI',
  description: 'Terms of Service for Robot Recruit AI platform',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300">
              These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and Robot Recruit AI ("Company", "we", "us", or "our") governing your access to and use of the Robot Recruit AI platform, including our website, applications, and AI bot services (collectively, the "Service").
            </p>
            <p className="text-gray-300 mt-4">
              <strong>By accessing or using the Service, you agree to be bound by these Terms.</strong> If you disagree with any part of these Terms, you must not access or use the Service.
            </p>
            <p className="text-gray-300 mt-4">
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility and Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">2.1 Age Requirements</h3>
            <p className="text-gray-300">
              You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">2.2 Account Security</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to notify us immediately of any unauthorized access or security breach</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>We reserve the right to terminate accounts that violate these Terms</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">2.3 Accurate Information</h3>
            <p className="text-gray-300">
              You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Service Description and AI Functionality</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.1 AI-Powered Services</h3>
            <p className="text-gray-300">
              Robot Recruit AI provides access to artificial intelligence-powered chatbots ("AI Bots") for various purposes including information assistance, task automation, and conversational support. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Pre-configured AI bots with specific knowledge domains</li>
              <li>Custom AI bot creation and training capabilities</li>
              <li>File upload and knowledge base management</li>
              <li>Conversation history and data export</li>
              <li>Premium features including voice recognition, image analysis, and web search</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">3.2 AI Limitations and Disclaimers</h3>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 my-4">
              <p className="text-yellow-200 font-semibold mb-3">IMPORTANT: AI-Generated Content Disclaimer</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>No Guarantee of Accuracy:</strong> AI-generated responses may contain errors, inaccuracies, or outdated information</li>
                <li><strong>Not Professional Advice:</strong> AI responses do not constitute professional medical, legal, financial, or other specialized advice</li>
                <li><strong>No Human Review:</strong> Responses are generated automatically without human verification</li>
                <li><strong>Potential Bias:</strong> AI models may reflect biases present in their training data</li>
                <li><strong>Hallucinations:</strong> AI may generate plausible-sounding but factually incorrect information</li>
                <li><strong>No Liability for AI Content:</strong> We are not responsible for decisions made based on AI-generated content</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">3.3 User Responsibility</h3>
            <p className="text-gray-300">
              <strong>You acknowledge and agree that:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>You are solely responsible for verifying the accuracy of AI-generated information</li>
              <li>You should not rely solely on AI responses for critical decisions</li>
              <li>You should consult qualified professionals for medical, legal, or financial matters</li>
              <li>You use the Service at your own risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Plans and Payments</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">4.1 Subscription Tiers</h3>
            <p className="text-gray-300">
              We offer multiple subscription tiers with varying features and capabilities. Subscription details, pricing, and features are displayed on our pricing page and may be changed with reasonable notice.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">4.2 Billing and Payments</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Recurring Billing:</strong> Subscriptions automatically renew unless cancelled</li>
              <li><strong>Payment Processing:</strong> Payments are processed securely through Stripe</li>
              <li><strong>Currency:</strong> All prices are in GBP (£) unless otherwise stated</li>
              <li><strong>Taxes:</strong> Prices may be subject to VAT as required by UK law</li>
              <li><strong>Failed Payments:</strong> We may suspend service for failed payments after reasonable notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">4.3 Cancellation and Refunds</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds are provided for partial billing periods except as required by law</li>
              <li>We reserve the right to offer refunds on a case-by-case basis</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">4.4 Free Trial and Promotional Codes</h3>
            <p className="text-gray-300">
              Free trials and promotional codes may be offered subject to specific terms. We reserve the right to modify or cancel promotional offers at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use Policy</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">5.1 Prohibited Uses</h3>
            <p className="text-gray-300 mb-3">You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Generate, distribute, or promote illegal content</li>
              <li>Create or distribute malware, viruses, or harmful code</li>
              <li>Engage in fraudulent, deceptive, or misleading activities</li>
              <li>Harass, threaten, or harm others</li>
              <li>Generate spam or unsolicited communications</li>
              <li>Infringe intellectual property rights</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Attempt to circumvent security measures or access restrictions</li>
              <li>Scrape, crawl, or systematically extract data from the Service</li>
              <li>Use the Service for competitive analysis or to build similar products</li>
              <li>Overload or disrupt the Service infrastructure</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">5.2 Content Restrictions</h3>
            <p className="text-gray-300 mb-3">You agree not to upload, submit, or generate content that:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Contains hate speech, discrimination, or promotes violence</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Relates to child exploitation or abuse</li>
              <li>Promotes self-harm or suicide</li>
              <li>Violates privacy or data protection laws</li>
              <li>Contains confidential or proprietary information without authorization</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">5.3 Enforcement</h3>
            <p className="text-gray-300">
              We reserve the right to investigate violations, remove content, suspend or terminate accounts, and report illegal activities to law enforcement without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">6.1 Our Intellectual Property</h3>
            <p className="text-gray-300">
              The Service, including all software, designs, text, graphics, logos, and other content (excluding User Content), is owned by Robot Recruit AI and protected by UK and international intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Service without express written permission.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">6.2 User Content and Data</h3>
            <p className="text-gray-300">
              You retain ownership of all content you upload, create, or submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, process, and transmit your User Content solely to provide and improve the Service.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">6.3 AI-Generated Content</h3>
            <p className="text-gray-300">
              Content generated by AI bots in response to your queries is provided to you for your use. However, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>AI-generated content may not be unique and similar content may be generated for other users</li>
              <li>You should not assume exclusive rights to AI-generated content</li>
              <li>You are responsible for ensuring AI-generated content does not infringe third-party rights</li>
              <li>We make no warranties regarding intellectual property status of AI-generated content</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">6.4 Feedback</h3>
            <p className="text-gray-300">
              If you provide feedback, suggestions, or ideas about the Service, you grant us unlimited rights to use such feedback without compensation or attribution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Protection and Privacy</h2>
            <p className="text-gray-300">
              Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data in compliance with UK GDPR and the Data Protection Act 2018. By using the Service, you consent to our data practices as described in the Privacy Policy.
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Important:</strong> Data you submit to AI bots is processed by third-party AI providers (primarily OpenAI). Please refer to our Privacy Policy for details about third-party data processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">8.1 Service "As Is"</h3>
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 my-4">
              <p className="text-red-200 font-semibold mb-3">IMPORTANT LEGAL DISCLAIMER</p>
              <p className="text-gray-300">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>
            <p className="text-gray-300 mt-4">We do not warrant that:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>AI-generated content will be accurate, complete, or reliable</li>
              <li>Defects will be corrected</li>
              <li>The Service will meet your specific requirements</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">8.2 Limitation of Liability</h3>
            <p className="text-gray-300 mb-3">TO THE MAXIMUM EXTENT PERMITTED BY UK LAW:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
              <li>We are not liable for losses resulting from:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>AI-generated content or advice</li>
                  <li>Decisions made based on the Service</li>
                  <li>Data loss or corruption</li>
                  <li>Third-party services or content</li>
                  <li>Unauthorized access to your account</li>
                  <li>Service interruptions or downtime</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">8.3 Exceptions</h3>
            <p className="text-gray-300">
              Nothing in these Terms excludes or limits our liability for:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any other liability that cannot be excluded by UK law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
            <p className="text-gray-300">
              You agree to indemnify, defend, and hold harmless Robot Recruit AI, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
              <li>Your use of AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Service Modifications and Termination</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">10.1 Service Changes</h3>
            <p className="text-gray-300">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with or without notice. We are not liable for any modification, suspension, or discontinuation of the Service.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">10.2 Termination by You</h3>
            <p className="text-gray-300">
              You may terminate your account at any time by following the account closure process in your settings. Upon termination, your data will be handled according to our Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">10.3 Termination by Us</h3>
            <p className="text-gray-300">
              We may suspend or terminate your account immediately without notice if:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>You violate these Terms</li>
              <li>Your account is involved in fraudulent or illegal activity</li>
              <li>Your payment method fails</li>
              <li>We are required to do so by law</li>
              <li>Continuing to provide service would cause us harm or liability</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">10.4 Effect of Termination</h3>
            <p className="text-gray-300">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Your right to use the Service immediately ceases</li>
              <li>You remain liable for any outstanding fees</li>
              <li>We may delete your data after a reasonable retention period</li>
              <li>Provisions that should survive termination (e.g., liability limitations) continue to apply</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Third-Party Services and Links</h2>
            <p className="text-gray-300">
              The Service may contain links to third-party websites or integrate with third-party services (including OpenAI, Stripe, and others). We are not responsible for the content, privacy practices, or terms of service of third parties. Your use of third-party services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">12.1 Governing Law</h3>
            <p className="text-gray-300">
              These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">12.2 Jurisdiction</h3>
            <p className="text-gray-300">
              Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">12.3 Informal Resolution</h3>
            <p className="text-gray-300">
              Before initiating formal proceedings, we encourage you to contact us to seek an informal resolution: <a href="mailto:legal@robotrecruitai.com" className="text-cyan-400 hover:underline">legal@robotrecruitai.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">13.1 Entire Agreement</h3>
            <p className="text-gray-300">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Robot Recruit AI regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">13.2 Severability</h3>
            <p className="text-gray-300">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">13.3 Waiver</h3>
            <p className="text-gray-300">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">13.4 Assignment</h3>
            <p className="text-gray-300">
              You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">13.5 Force Majeure</h3>
            <p className="text-gray-300">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Service with an updated "Last Updated" date. Significant changes will be communicated via email or prominent notice. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
              <p className="text-gray-300"><strong>Company Name:</strong> Robot Recruit AI</p>
              <p className="text-gray-300 mt-2"><strong>Registered Address:</strong> [Your Company Address, UK]</p>
              <p className="text-gray-300 mt-2"><strong>Company Number:</strong> [Your Companies House Registration Number]</p>
              <p className="text-gray-300 mt-2"><strong>VAT Number:</strong> [Your VAT Number if applicable]</p>
              <p className="text-gray-300 mt-2"><strong>Email:</strong> <a href="mailto:legal@robotrecruitai.com" className="text-cyan-400 hover:underline">legal@robotrecruitai.com</a></p>
              <p className="text-gray-300 mt-2"><strong>Support:</strong> <a href="mailto:support@robotrecruitai.com" className="text-cyan-400 hover:underline">support@robotrecruitai.com</a></p>
            </div>
          </section>

          <section className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-purple-400 mb-3">By Using Our Service</h3>
            <p className="text-gray-300">
              By accessing or using Robot Recruit AI, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

