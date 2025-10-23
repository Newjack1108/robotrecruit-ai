import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Robot Recruit AI',
  description: 'Our commitment to protecting your privacy and data',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-cyan-500/20 rounded-lg">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-orbitron">Privacy Policy</h1>
          <p className="text-gray-400">Last Updated: 25 January 2025</p>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="prose prose-invert max-w-none p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              Robot Recruit AI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered bot recruitment and management platform (the "Service"). This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Data Controller:</strong> AI Works UK<br />
              <strong>Company:</strong> Registered in England and Wales<br />
              <strong>Address:</strong> Coach House, Ways Green, Cheshire, CW7 4AN<br />
              <strong>Email:</strong> service@robotrecruit.ai
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

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide, maintain, and improve the AI bot services</li>
              <li>Process your conversations with AI assistants</li>
              <li>Train and customize AI bots based on your uploaded data</li>
              <li>Generate AI responses using OpenAI's GPT models</li>
              <li>Store conversation history for your reference</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">3.2 Account Management</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Create and manage your account</li>
              <li>Process subscription payments and billing</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send service-related notifications and updates</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">3.3 Platform Improvement</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Analyze usage patterns to improve AI performance</li>
              <li>Develop new features and functionality</li>
              <li>Monitor and prevent fraudulent or abusive activity</li>
              <li>Ensure platform security and integrity</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">3.4 Legal Basis for Processing (UK GDPR)</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you've subscribed to</li>
              <li><strong>Legitimate Interests:</strong> Improving our services, fraud prevention, security</li>
              <li><strong>Consent:</strong> Marketing communications (where applicable)</li>
              <li><strong>Legal Obligation:</strong> Compliance with UK laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. AI Processing and Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">4.1 OpenAI Integration</h3>
            <p className="text-gray-300">
              We use OpenAI's API to power our AI bot conversations. When you interact with our AI bots:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Your messages and uploaded files are sent to OpenAI for processing</li>
              <li>OpenAI processes this data to generate AI responses</li>
              <li>OpenAI retains data for 30 days for abuse monitoring, then deletes it</li>
              <li>OpenAI does not use your data to train their models (as per their API terms)</li>
              <li>Data is encrypted in transit and at rest</li>
            </ul>
            <p className="text-gray-300 mt-4">
              OpenAI's Privacy Policy: <a href="https://openai.com/privacy" className="text-cyan-400 hover:underline">https://openai.com/privacy</a>
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">4.2 Other Third-Party Services</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Clerk (Authentication):</strong> User authentication and account management</li>
              <li><strong>Stripe (Payments):</strong> Secure payment processing (PCI-DSS compliant)</li>
              <li><strong>Vercel (Hosting):</strong> Platform hosting and infrastructure</li>
              <li><strong>PostgreSQL (Database):</strong> Secure data storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active, then deleted within 90 days of account closure</li>
              <li><strong>Conversation History:</strong> Stored indefinitely unless you delete it or close your account</li>
              <li><strong>Custom Bot Training Data:</strong> Retained until you delete the bot or close your account</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for tax and accounting purposes</li>
              <li><strong>Support Tickets:</strong> Retained for 3 years for customer service purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Data Protection Rights (UK GDPR)</h2>
            <p className="text-gray-300 mb-4">Under UK GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Right of Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Rights Related to Automated Decision-Making:</strong> Not to be subject to decisions based solely on automated processing</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, contact us at: <a href="mailto:service@robotrecruit.ai" className="text-cyan-400 hover:underline">service@robotrecruit.ai</a>
            </p>
            <p className="text-gray-300 mt-4">
              You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO): <a href="https://ico.org.uk" className="text-cyan-400 hover:underline">https://ico.org.uk</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
            <p className="text-gray-300">We implement appropriate technical and organizational measures to protect your data:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-4">
              <li>End-to-end encryption for data in transit (TLS/SSL)</li>
              <li>Encryption at rest for stored data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Staff training on data protection and security</li>
              <li>Incident response procedures for data breaches</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
            <p className="text-gray-300">
              Some of our service providers (including OpenAI) are based in the United States. When we transfer your data outside the UK/EEA, we ensure adequate safeguards are in place:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-4">
              <li>Standard Contractual Clauses (SCCs) approved by the UK ICO</li>
              <li>Adequacy decisions where applicable</li>
              <li>Additional security measures to protect transferred data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-300 mb-4">We use cookies and similar technologies for:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Analytics Cookies:</strong> To understand how you use our service (with your consent)</li>
              <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
            </ul>
            <p className="text-gray-300 mt-4">
              You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300">
              Our Service is not intended for children under 13 years of age (or 16 in the UK for GDPR purposes). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. AI-Specific Privacy Considerations</h2>
            <p className="text-gray-300 mb-4"><strong>Important Information About AI-Generated Content:</strong></p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>AI responses are generated by machine learning models and may not always be accurate</li>
              <li>You should not share sensitive personal information in AI conversations</li>
              <li>AI bots do not have memory between sessions unless explicitly enabled</li>
              <li>Custom bot training data is isolated to your account and not shared with other users</li>
              <li>We implement content filtering to prevent harmful or inappropriate AI responses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-4">
              <li>Posting the new policy on this page with an updated "Last Updated" date</li>
              <li>Sending an email notification to your registered address</li>
              <li>Displaying a prominent notice within the Service</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Your continued use of the Service after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-300">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
              <p className="text-gray-300"><strong>Company:</strong> AI Works UK</p>
              <p className="text-gray-300 mt-2"><strong>Email:</strong> <a href="mailto:service@robotrecruit.ai" className="text-cyan-400 hover:underline">service@robotrecruit.ai</a></p>
              <p className="text-gray-300 mt-2"><strong>Support:</strong> Create a ticket through the platform</p>
              <p className="text-gray-300 mt-2"><strong>Address:</strong> Coach House, Ways Green, Cheshire, CW7 4AN</p>
              <p className="text-gray-300 mt-2"><strong>Registered:</strong> England and Wales</p>
              <p className="text-gray-300 mt-2"><strong>ICO Registration:</strong> [Pending - to be added]</p>
            </div>
          </section>

          <section className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Your Privacy Matters</h3>
            <p className="text-gray-300">
              We are committed to transparency and protecting your rights under UK GDPR. If you have any concerns about how we handle your data, please don't hesitate to contact us.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

