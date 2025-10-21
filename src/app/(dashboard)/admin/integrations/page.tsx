import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default async function AdminIntegrationsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const isAdmin = adminEmails.includes(userEmail);

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Check which integrations are configured
  const integrations = [
    {
      name: 'Clerk',
      category: 'Authentication',
      description: 'User authentication and management',
      website: 'https://clerk.com',
      docs: 'https://clerk.com/docs',
      dashboard: 'https://dashboard.clerk.com',
      envVars: [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
      ],
      configured: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
      required: true,
      features: ['Sign up/Sign in', 'User profiles', 'Session management', 'Social logins'],
    },
    {
      name: 'OpenAI',
      category: 'AI & ML',
      description: 'ChatGPT API for bot conversations and AI assistants',
      website: 'https://openai.com',
      docs: 'https://platform.openai.com/docs',
      dashboard: 'https://platform.openai.com',
      envVars: [
        'OPENAI_API_KEY',
      ],
      configured: !!process.env.OPENAI_API_KEY,
      required: true,
      features: ['Bot conversations', 'AI assistants', 'Vector stores', 'File analysis'],
    },
    {
      name: 'Stripe',
      category: 'Payments',
      description: 'Payment processing and subscription management',
      website: 'https://stripe.com',
      docs: 'https://stripe.com/docs',
      dashboard: 'https://dashboard.stripe.com',
      envVars: [
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
        'NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID',
      ],
      configured: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY),
      required: false,
      features: ['Subscription billing', 'Payment processing', 'Webhook events', 'Customer portal'],
    },
    {
      name: 'Prisma',
      category: 'Database',
      description: 'Database ORM and migration tool',
      website: 'https://prisma.io',
      docs: 'https://www.prisma.io/docs',
      dashboard: 'https://www.prisma.io/studio',
      envVars: [
        'DATABASE_URL',
      ],
      configured: !!process.env.DATABASE_URL,
      required: true,
      features: ['Database schema', 'Type-safe queries', 'Migrations', 'Database studio'],
    },
    {
      name: 'ImgBB',
      category: 'Media Storage',
      description: 'Image hosting and CDN for user uploads',
      website: 'https://imgbb.com',
      docs: 'https://api.imgbb.com',
      dashboard: 'https://imgbb.com/upload',
      envVars: [
        'IMGBB_API_KEY',
      ],
      configured: !!process.env.IMGBB_API_KEY,
      required: false,
      features: ['Image uploads', 'Bot avatars', 'User showcases', 'Achievement images'],
    },
    {
      name: 'Vercel',
      category: 'Hosting',
      description: 'Application hosting and deployment',
      website: 'https://vercel.com',
      docs: 'https://vercel.com/docs',
      dashboard: 'https://vercel.com/dashboard',
      envVars: [],
      configured: true,
      required: true,
      features: ['Hosting', 'Serverless functions', 'Edge runtime', 'Analytics'],
    },
    {
      name: 'Next.js',
      category: 'Framework',
      description: 'React framework for production',
      website: 'https://nextjs.org',
      docs: 'https://nextjs.org/docs',
      dashboard: null,
      envVars: [],
      configured: true,
      required: true,
      features: ['Server rendering', 'API routes', 'File-based routing', 'Image optimization'],
    },
    {
      name: 'Tailwind CSS',
      category: 'Styling',
      description: 'Utility-first CSS framework',
      website: 'https://tailwindcss.com',
      docs: 'https://tailwindcss.com/docs',
      dashboard: null,
      envVars: [],
      configured: true,
      required: true,
      features: ['Utility classes', 'Responsive design', 'Dark mode', 'Custom themes'],
    },
    {
      name: 'SerpAPI',
      category: 'Search',
      description: 'Web search API for bot web search power-up (optional)',
      website: 'https://serpapi.com',
      docs: 'https://serpapi.com/docs',
      dashboard: 'https://serpapi.com/dashboard',
      envVars: [
        'SERPAPI_API_KEY',
      ],
      configured: !!process.env.SERPAPI_API_KEY,
      required: false,
      features: ['Web search', 'Bot search capability', 'Real-time results'],
    },
  ];

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Third-Party Integrations</h2>
        <p className="text-gray-400">Manage and monitor all external services used by the application.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Configured</p>
              <p className="text-3xl font-bold text-green-400">{integrations.filter(i => i.configured).length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Required</p>
              <p className="text-3xl font-bold text-yellow-400">{integrations.filter(i => i.required).length}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-700/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Not Configured</p>
              <p className="text-3xl font-bold text-red-400">{integrations.filter(i => !i.configured).length}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Integrations by Category */}
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-orbitron font-bold text-cyan-400">{category}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations
              .filter(integration => integration.category === category)
              .map(integration => (
                <Card key={integration.name} className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700/50 shadow-lg hover:border-cyan-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-orbitron text-cyan-400 flex items-center gap-2">
                          {integration.name}
                          {integration.configured ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-gray-300 mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                      {integration.required && (
                        <Badge variant="destructive" className="ml-2">Required</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2 font-semibold">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Environment Variables */}
                    {integration.envVars.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2 font-semibold">Environment Variables:</p>
                        <div className="bg-gray-900/50 rounded-md p-3 space-y-1">
                          {integration.envVars.map(envVar => {
                            const isSet = !!process.env[envVar];
                            return (
                              <div key={envVar} className="flex items-center gap-2">
                                {isSet ? (
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )}
                                <code className="text-xs text-gray-300">{envVar}</code>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={integration.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        Website <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-gray-600">•</span>
                      <a
                        href={integration.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        Documentation <ExternalLink className="w-3 h-3" />
                      </a>
                      {integration.dashboard && (
                        <>
                          <span className="text-gray-600">•</span>
                          <a
                            href={integration.dashboard}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          >
                            Dashboard <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Setup Instructions */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-blue-700/50 shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-blue-400">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-white">For Missing Integrations:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              <li>Visit the integration's website and sign up for an account</li>
              <li>Navigate to their dashboard and generate API keys</li>
              <li>Add the required environment variables to your <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">.env.local</code> file</li>
              <li>Restart your development server or redeploy to Vercel</li>
              <li>Return to this page to verify the integration is configured</li>
            </ol>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> Required integrations must be configured for the application to function properly.
              Optional integrations enhance features but are not critical for core functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

