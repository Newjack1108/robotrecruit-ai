import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Robot Recruit AI',
  description: 'Information about how we use cookies and similar technologies',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-orange-500/20 rounded-lg">
          <Cookie className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-orbitron">Cookie Policy</h1>
          <p className="text-gray-400">Last Updated: 25 January 2025</p>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="prose prose-invert max-w-none p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              This Cookie Policy explains how AI Works UK (trading as "RobotRecruit.AI") uses cookies and similar technologies on our website and platform (the "Service"). This policy should be read in conjunction with our Privacy Policy.
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Company Information:</strong><br />
              AI Works UK<br />
              Registered in England and Wales<br />
              Coach House, Ways Green, Cheshire, CW7 4AN<br />
              Email: <a href="mailto:service@robotrecruit.ai" className="text-cyan-400 hover:underline">service@robotrecruit.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. What Are Cookies?</h2>
            <p className="text-gray-300">
              Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Types of Cookies:</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
                <li><strong>First-Party Cookies:</strong> Set by the website you're visiting (RobotRecruit.AI)</li>
                <li><strong>Third-Party Cookies:</strong> Set by other organizations' services embedded in our website</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Cookies</h2>
            <p className="text-gray-300 mb-4">
              We use cookies for the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.1 Essential Cookies (Strictly Necessary)</h3>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-3">
                These cookies are required for the Service to function and cannot be disabled. They include:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Authentication:</strong> Keep you logged in to your account (provided by Clerk)</li>
                <li><strong>Security:</strong> Protect against fraud and maintain security</li>
                <li><strong>Session Management:</strong> Remember your preferences during a session</li>
                <li><strong>Load Balancing:</strong> Distribute traffic efficiently across servers</li>
              </ul>
              <p className="text-gray-300 mt-4">
                <strong>Legal Basis:</strong> These cookies are necessary for contract performance and legitimate interests in providing secure services. They do not require consent under UK PECR.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.2 Functionality Cookies</h3>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-3">
                These cookies enable enhanced functionality and personalization:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Preferences:</strong> Remember your language, theme, and display settings</li>
                <li><strong>Chat History:</strong> Maintain conversation context and history</li>
                <li><strong>Custom Bot Settings:</strong> Store your custom AI bot configurations</li>
                <li><strong>Feature States:</strong> Remember which features you've enabled or disabled</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Disabling these cookies may affect the functionality of certain features but the core Service will remain accessible.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.3 Analytics Cookies</h3>
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-3">
                These cookies help us understand how visitors use our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Usage Statistics:</strong> Track which pages are visited and how long users stay</li>
                <li><strong>Performance Monitoring:</strong> Identify technical issues and loading times</li>
                <li><strong>Feature Usage:</strong> Understand which features are most popular</li>
                <li><strong>User Behavior:</strong> Analyze navigation patterns to improve user experience</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We use analytics data to improve the Service and develop new features. Data is collected in aggregate form and does not personally identify you.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3">3.4 Marketing and Advertising Cookies</h3>
            <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-6">
              <p className="text-gray-300">
                <strong>We currently do not use marketing or advertising cookies.</strong> If this changes in the future, we will update this policy and request your consent before implementing such cookies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-300 mb-4">
              Our Service integrates with third-party services that may set their own cookies:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Clerk (Authentication)</h3>
                <p className="text-gray-300 mb-2">
                  <strong>Purpose:</strong> User authentication and account management
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Cookies Set:</strong> Authentication tokens, session management
                </p>
                <p className="text-gray-300">
                  <strong>Privacy Policy:</strong> <a href="https://clerk.com/privacy" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">https://clerk.com/privacy</a>
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Stripe (Payment Processing)</h3>
                <p className="text-gray-300 mb-2">
                  <strong>Purpose:</strong> Secure payment processing and fraud prevention
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Cookies Set:</strong> Payment session management, fraud detection
                </p>
                <p className="text-gray-300">
                  <strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">https://stripe.com/privacy</a>
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Vercel (Hosting)</h3>
                <p className="text-gray-300 mb-2">
                  <strong>Purpose:</strong> Content delivery and performance optimization
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Cookies Set:</strong> Load balancing, performance monitoring
                </p>
                <p className="text-gray-300">
                  <strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com/legal/privacy-policy</a>
                </p>
              </div>
            </div>

            <p className="text-gray-300 mt-6">
              <em>Note: We are not responsible for the privacy practices of third-party services. Please review their privacy policies for details on how they use cookies.</em>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">5.1 Browser Settings</h3>
            <p className="text-gray-300 mb-4">
              Most web browsers allow you to control cookies through their settings:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Block all cookies:</strong> Prevents websites from setting any cookies</li>
              <li><strong>Block third-party cookies:</strong> Allows first-party cookies but blocks third-party ones</li>
              <li><strong>Delete cookies:</strong> Removes cookies already stored on your device</li>
              <li><strong>Get notifications:</strong> Receive alerts when cookies are set</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">5.2 Browser-Specific Instructions</h3>
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>
              <p className="text-gray-300 mt-4">
                For detailed instructions, visit: <a href="https://www.allaboutcookies.org" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mb-3 mt-6">5.3 Impact of Disabling Cookies</h3>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
              <p className="text-yellow-200 font-semibold mb-3">⚠️ Important Notice</p>
              <p className="text-gray-300 mb-3">
                Disabling cookies may affect the functionality of RobotRecruit.AI:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong>Essential cookies disabled:</strong> You will not be able to log in or use the Service</li>
                <li><strong>Functionality cookies disabled:</strong> Preferences won't be saved; you'll need to re-enter settings</li>
                <li><strong>Analytics cookies disabled:</strong> No impact on functionality, but helps us less in improving the Service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Other Tracking Technologies</h2>
            <p className="text-gray-300 mb-4">
              In addition to cookies, we may use other technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Local Storage:</strong> Store data locally in your browser for performance and offline functionality</li>
              <li><strong>Session Storage:</strong> Temporary storage that clears when you close the browser</li>
              <li><strong>Web Beacons:</strong> Small transparent images used to track page views and email opens</li>
              <li><strong>Device Fingerprinting:</strong> Collect device information for security and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. International Data Transfers</h2>
            <p className="text-gray-300">
              Some cookies and tracking technologies may result in data being transferred to countries outside the UK/EEA (particularly the United States where our hosting and third-party services are located). We ensure appropriate safeguards are in place for such transfers, including Standard Contractual Clauses approved by the UK ICO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="text-gray-300 mb-4">
              Under UK GDPR and PECR, you have rights regarding cookies and tracking:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Right to Refuse:</strong> You can refuse non-essential cookies</li>
              <li><strong>Right to Withdraw Consent:</strong> Change your cookie preferences at any time</li>
              <li><strong>Right to Information:</strong> Know what cookies are being used and why</li>
              <li><strong>Right to Complain:</strong> Lodge a complaint with the UK Information Commissioner's Office (ICO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Updates to This Policy</h2>
            <p className="text-gray-300">
              We may update this Cookie Policy to reflect changes in technology, legal requirements, or our practices. Updates will be posted with a revised "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have questions about our use of cookies or this Cookie Policy:
            </p>
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <p className="text-gray-300"><strong>Company:</strong> AI Works UK</p>
              <p className="text-gray-300 mt-2"><strong>Trading As:</strong> RobotRecruit.AI</p>
              <p className="text-gray-300 mt-2"><strong>Address:</strong> Coach House, Ways Green, Cheshire, CW7 4AN</p>
              <p className="text-gray-300 mt-2"><strong>Registered:</strong> England and Wales</p>
              <p className="text-gray-300 mt-2"><strong>Email:</strong> <a href="mailto:service@robotrecruit.ai" className="text-cyan-400 hover:underline">service@robotrecruit.ai</a></p>
              <p className="text-gray-300 mt-2"><strong>ICO Complaints:</strong> <a href="https://ico.org.uk/make-a-complaint/" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk/make-a-complaint/</a></p>
            </div>
          </section>

          <section className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-orange-400 mb-3">Your Cookie Choices Matter</h3>
            <p className="text-gray-300">
              We respect your privacy and your right to control cookies. While some cookies are essential for the Service to work, you always have the choice to manage non-essential cookies through your browser settings.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

