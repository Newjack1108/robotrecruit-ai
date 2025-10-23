import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, Zap, Shield, Sparkles, CheckCircle, Star, Users, 
  Rocket, Heart, Headphones, TrendingUp, Gift, Wrench, ChevronDown 
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VimeoPlayer } from '@/components/ui/VimeoPlayer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RobotRecruit.AI",
    "applicationCategory": "BusinessApplication",
    "description": "AI-powered recruitment platform with specialized bots for every need. Expert guidance, 24/7 availability, and custom training capabilities.",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP",
      "description": "Free tier available forever"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1"
    },
    "featureList": [
      "24/7 AI Bot Availability",
      "Custom Bot Training",
      "Multiple Specialized Bots",
      "Image Recognition",
      "Voice Response",
      "File Upload",
      "Web Search Integration",
      "Scheduling Assistant",
      "Data Export"
    ]
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Background Image with Overlay */}
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

      {/* Animated Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-gray-900/50 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-300 hover:text-white font-orbitron">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-orbitron">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-6xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <Logo size="xl" />
            </div>

            {/* Hero Video */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-3xl"></div>
              <div className="relative w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <VimeoPlayer
                  videoId="1128148745"
                  autoplay={true}
                  muted={true}
                  loop={true}
                  background={false}
                  className="absolute top-0 left-0 w-full h-full"
                  title="RobotRecruit.AI Header Video"
                  showPlayButton={false}
                />
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-center text-white mb-6">
              Built from Recycled <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Components</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-center text-cyan-300 font-light mb-8 italic">
              "We're not here to take your job, we're here to help!"
            </p>

            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
              Your AI-powered recruitment agency with specialized bots for every need. 
              Expert guidance, 24/7 availability, and custom training capabilities.
            </p>

            {/* Boss Bot Video */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden mb-6">
                <VimeoPlayer
                  videoId="1128148719"
                  autoplay={false}
                  muted={true}
                  loop={false}
                  className="w-full aspect-square"
                  title="Boss Bot Introduction"
                  showPlayButton={true}
                />
              </div>
              
              <Link href="/sign-up">
                <Button className="group relative px-16 py-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white text-2xl font-bold font-orbitron rounded-xl shadow-2xl transition-all hover:scale-110 animate-pulse hover:animate-none">
                  <Rocket className="w-8 h-8 mr-3" />
                  GET STARTED
                </Button>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/sign-up" className="w-full sm:w-auto flex justify-center">
                <Button className="group relative px-12 py-7 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold rounded-xl shadow-2xl transition-all hover:scale-105">
                  <Rocket className="w-6 h-6 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              
              <Link href="/sign-in" className="w-full sm:w-auto flex justify-center">
                <Button variant="outline" className="px-12 py-7 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xl font-bold rounded-xl backdrop-blur-sm transition-all hover:scale-105">
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="text-center text-gray-500 text-sm">
              ✨ No credit card required • Free tier available forever
            </p>
          </div>
        </section>

        {/* Why Specialized Bots Section */}
        <section className="py-20 bg-gradient-to-b from-purple-950/30 via-cyan-950/20 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
                  Why Specialized Bots Beat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Generic AI</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  General AI tries to know everything. Our bots master one thing.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Generic AI - The Problem */}
                <Card className="bg-red-900/20 backdrop-blur-xl border-red-500/30">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                        <span className="text-4xl">🤔</span>
                      </div>
                      <h3 className="text-2xl font-orbitron font-bold text-red-300 mb-2">Generic AI</h3>
                      <p className="text-red-400/80 text-sm">Jack of all trades, master of none</p>
                    </div>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">❌</span>
                        <span>Searches the entire internet for answers - often gets it wrong</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">❌</span>
                        <span>Generic responses that lack depth and expertise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">❌</span>
                        <span>No boundaries - will attempt anything, even outside its knowledge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">❌</span>
                        <span>Wastes your time with irrelevant information</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Specialized Bots - The Solution */}
                <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border-cyan-500/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <h3 className="text-2xl font-orbitron font-bold text-cyan-300 mb-2">Our Specialist Bots</h3>
                      <p className="text-cyan-400/80 text-sm">Trained experts in their field</p>
                    </div>
                    <ul className="space-y-3 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✅</span>
                        <span><strong>Focused expertise</strong> - Only answers within their specialty</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✅</span>
                        <span><strong>Deep knowledge</strong> - Years of training data in one domain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✅</span>
                        <span><strong>Knows their limits</strong> - Won't guess outside their expertise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✅</span>
                        <span><strong>Faster, better answers</strong> - No wading through irrelevant info</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Key Benefits */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
                  🎯 The Specialist Advantage
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">10x</div>
                    <p className="text-gray-300">More Accurate</p>
                    <p className="text-sm text-gray-500 mt-1">In their field of expertise</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">3x</div>
                    <p className="text-gray-300">Faster Responses</p>
                    <p className="text-sm text-gray-500 mt-1">No irrelevant searching</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
                    <p className="text-gray-300">Focused</p>
                    <p className="text-sm text-gray-500 mt-1">Stays in their lane</p>
                  </div>
                </div>
              </div>

              {/* Real Example */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
                <h4 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Real Example: Beekeeping Question
                </h4>
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 font-semibold mb-2">❌ Generic AI:</p>
                    <p className="text-gray-300 text-sm italic">
                      "Here are 47 articles about bees... Let me search Wikipedia... Did you know bees can fly 15mph? 
                      Also, here's a recipe for honey cake and the history of beekeeping in ancient Egypt..."
                    </p>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                    <p className="text-cyan-300 font-semibold mb-2">✅ Bee Bot:</p>
                    <p className="text-gray-200 text-sm italic">
                      "Your hive has swarming behavior because it's overcrowded. Here's exactly what to do: 
                      1) Add a super box within 48 hours, 2) Check queen cells, 3) Ensure proper ventilation. 
                      Let me walk you through each step..."
                    </p>
                  </div>
                </div>
                <p className="text-center text-cyan-400 font-semibold mt-6">
                  👆 One gives you noise. One solves your problem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 bg-gradient-to-b from-cyan-950/20 to-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center text-white mb-16">
              Why Choose <span className="text-cyan-400">RobotRecruit.AI</span>?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Bot, title: 'Specialized Experts', desc: 'Each bot is trained in specific domains for accurate, expert-level guidance' },
                { icon: Sparkles, title: 'Custom Bot Creation', desc: 'Build and train your own AI assistants with your unique knowledge base' },
                { icon: Zap, title: 'Instant Responses', desc: '24/7 availability with lightning-fast AI-powered answers to your questions' },
                { icon: Shield, title: 'Safe & Secure', desc: 'Enterprise-grade security with data encryption and privacy protection' },
                { icon: Gift, title: 'Free Tier Forever', desc: 'Access core features and free bots without ever paying a dime' },
                { icon: TrendingUp, title: 'Continuously Learning', desc: 'Bots improve over time with advanced AI training and updates' },
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-900/50 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-6">
                      <feature.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-16">
              
              {/* Feature 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/50">
                    <Gift className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-300 font-orbitron font-semibold">FREE TRIAL</span>
                  </div>
                  <h3 className="text-4xl font-orbitron font-bold text-white">
                    Try Risk-Free with Our 7-Day Trial
                  </h3>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Experience our AI bots with a free 7-day trial. 
                    No credit card required. Upgrade anytime for full access to all premium features.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Access to 2 specialist bots',
                      '5 free powerup credits to try advanced features',
                      'Up to 10 conversations',
                      'Upgrade anytime for full access',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300 text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl"></div>
                  <Card className="relative bg-gray-900/80 backdrop-blur-xl border-cyan-500/50">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🎁</div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-2">7-Day Free Trial</h4>
                      <p className="text-cyan-400 text-lg mb-4">No credit card required</p>
                      <p className="text-gray-400 text-sm">Upgrade to Pro ($9.99/mo) or Premium ($29.99/mo) anytime</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl"></div>
                  <Card className="relative bg-gray-900/80 backdrop-blur-xl border-purple-500/50">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🤖</div>
                      <h4 className="text-2xl font-orbitron font-bold text-white mb-2">Custom Bots</h4>
                      <p className="text-purple-400 text-lg mb-4">Train your own AI</p>
                      <p className="text-gray-400 text-sm">Upload files, customize responses</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="order-1 md:order-2 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/50">
                    <Wrench className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-orbitron font-semibold">CUSTOMIZABLE</span>
                  </div>
                  <h3 className="text-4xl font-orbitron font-bold text-white">
                    Create & Train Your Own Bots
                  </h3>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Upload your documents, training materials, and knowledge base. 
                    Your custom bot learns from YOUR content to provide tailored assistance.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Upload PDFs, docs, and images',
                      'Custom personality and tone',
                      'Train on your specific expertise',
                      'Share with your team or customers',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300 text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-b from-blue-950/20 to-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center text-white mb-4">
              Trusted by <span className="text-cyan-400">Thousands</span>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16">
              Real people, real results, real success stories
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Kelvin Newman',
                  role: 'Hobbyist Beekeeper',
                  content: 'Bee Bot helped me in my first years of beekeeping - from introducing a colony right through to extracting honey into jars. Absolutely invaluable!',
                  rating: 5,
                },
                {
                  name: 'Sarah Johnson',
                  role: 'Startup Founder',
                  content: 'Boss Bot helped me scale my startup from 5 to 50 employees. The strategic insights were game-changing!',
                  rating: 5,
                },
                {
                  name: 'Maria Rodriguez',
                  role: 'Home Chef',
                  content: 'Chef Bot transformed my cooking! From basic meals to restaurant-quality dishes. My family loves every meal now!',
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-gray-900/80 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center text-white mb-16">
              Our <span className="text-cyan-400">Guarantees</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: '100% Money-Back',
                  desc: 'Not satisfied with your paid plan? Get a full refund within 30 days, no questions asked.',
                  color: 'cyan',
                },
                {
                  icon: Headphones,
                  title: 'Free Support',
                  desc: 'Dedicated customer support via chat and email. We respond within 24 hours.',
                  color: 'blue',
                },
                {
                  icon: Heart,
                  title: 'Always Improving',
                  desc: 'Regular updates and new bots added monthly at no extra cost.',
                  color: 'purple',
                },
              ].map((guarantee, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-${guarantee.color}-500/20 rounded-full mb-6 border-2 border-${guarantee.color}-500/50`}>
                    <guarantee.icon className={`w-10 h-10 text-${guarantee.color}-400`} />
                  </div>
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-3">{guarantee.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{guarantee.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center text-white mb-16">
              Frequently Asked <span className="text-cyan-400">Questions</span>
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: 'What makes RobotRecruit.AI different from other AI chatbots?',
                  a: 'Our bots are specialized experts in their fields, not generic assistants. Each bot is trained on specific knowledge domains and can provide deep, expert-level guidance. Plus, you can create and train your own custom bots!',
                },
                {
                  q: 'Is there really a free tier?',
                  a: 'Yes! Start with a 7-day free trial that includes access to 2 bots, 5 powerup credits, and up to 10 chats. After the trial, you can continue with our free tier (Boss Bot advisor) or upgrade to Pro or Premium for more bots, custom bot creation, and unlimited chats.',
                },
                {
                  q: 'What\'s included in the free trial vs paid plans?',
                  a: 'Free Trial (7 days): Access to 2 specialist bots, 5 powerup credits, and 10 chats. Pro Plan ($9.99/mo): Access to 5 bots, 20 powerup credits per month, custom bot creation, and unlimited chats. Premium Plan ($29.99/mo): All 13+ bots, 50 powerup credits, priority support, and advanced features.',
                },
                {
                  q: 'How do I create a custom bot?',
                  a: 'With a Pro subscription, navigate to the Bots page and click "Create New Bot". Upload your training documents (PDFs, images, text files), set the personality, and your bot is ready! It\'s that simple.',
                },
                {
                  q: 'What if I\'m not satisfied?',
                  a: 'We offer a 7-day free trial - no credit card required. If you upgrade to a paid plan and are not completely satisfied, we offer a 30-day money-back guarantee on paid subscriptions.',
                },
                {
                  q: 'Can I use this for my business?',
                  a: 'Yes! Many businesses use RobotRecruit.AI to create customer support bots, internal knowledge assistants, and training resources. Our Pro and Premium tiers are perfect for teams.',
                },
                {
                  q: 'How secure is my data?',
                  a: 'We use enterprise-grade encryption, secure servers, and follow strict data privacy protocols. Your conversations and uploaded files are never shared or used to train other models.',
                },
              ].map((faq, index) => (
                <Card key={index} className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-cyan-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <ChevronDown className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-orbitron font-bold text-white mb-3">{faq.q}</h3>
                        <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
                <Card className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500/50 shadow-2xl">
                  <CardContent className="p-16">
                    <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
                      Ready to Get Started?
                    </h2>
                    <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
                      Join thousands of users who trust RobotRecruit.AI for expert AI assistance.
                      <br />
                      <span className="text-cyan-400 italic">"We're not here to take your job, we're here to help!"</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                      <Link href="/sign-up">
                        <Button className="px-12 py-7 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold rounded-xl shadow-2xl transition-all hover:scale-110">
                          <Rocket className="w-6 h-6 mr-2" />
                          Start Your Free Trial
                        </Button>
                      </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>No credit card required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Free support included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-cyan-500/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <Logo size="md" />
              <p className="text-gray-500 mt-4">
                © 2025 AI Works UK (trading as RobotRecruit.AI) - Built from recycled components with ❤️
              </p>
              <p className="text-gray-600 text-sm mt-2 italic">
                "We're not here to take your job, we're here to help!"
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 text-sm">
              <Link href="/sign-in" className="hover:text-cyan-400 transition-colors">
                Sign In
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                Terms & Conditions
              </Link>
              <span>•</span>
              <Link href="/disclaimer" className="hover:text-cyan-400 transition-colors">
                Disclaimer
              </Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-cyan-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
