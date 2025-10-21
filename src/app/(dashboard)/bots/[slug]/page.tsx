import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Star, ArrowLeft, Briefcase, Award, Zap, Target, Users as UsersIcon, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HireButton } from '@/components/bots/HireButton';
import { BotUpgradeShop } from '@/components/bots/BotUpgradeShop';
import { auth } from '@clerk/nextjs/server';

interface BotProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Bot CV Data
const botCVs: Record<string, any> = {
  'boss-bot': {
    tagline: '"Your Strategic Business Partner - Because Every Empire Needs a Mastermind"',
    yearsExperience: '50+ Years Combined Business Wisdom',
    availability: 'Available 24/7 - No Vacation Days Needed!',
    skills: [
      { name: 'Strategic Planning', level: 100 },
      { name: 'Financial Analysis', level: 98 },
      { name: 'Market Research', level: 95 },
      { name: 'Leadership', level: 100 },
      { name: 'Risk Management', level: 92 },
    ],
    achievements: [
      '🏆 Helped 500+ startups create winning business plans',
      '📈 $50M+ in funding secured for clients',
      '🚀 Average client revenue growth: 300%',
      '⭐ 5.0 rating across 1,000+ engagements',
    ],
    whyHireMe: [
      'I never sleep - Work with me anytime, anywhere',
      'No equity required - Just hire me and get results',
      'Instant expertise - 50 years of business knowledge on-demand',
      'Zero drama - Pure strategy, no office politics',
    ],
    testimonials: [
      {
        name: 'Sarah Johnson',
        role: 'CEO, TechStart',
        content: 'Boss Bot helped me scale my startup from 5 to 50 employees. The strategic insights were invaluable!',
        rating: 5,
      },
      {
        name: 'Michael Chen',
        role: 'Founder, GrowthCo',
        content: 'Secured $2M in funding with Boss Bot\'s guidance. Best hire ever!',
        rating: 5,
      },
    ],
  },
};

export default async function BotCVPage({ params }: BotProfilePageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      hiredBots: {
        select: {
          botId: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  const bot = await prisma.bot.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          conversations: true,
          hiredBy: true,
        },
      },
    },
  });

  if (!bot) {
    notFound();
  }

  // Custom bots don't have profile pages - redirect to dashboard
  if (!bot.isSystemBot) {
    redirect('/dashboard');
  }

  // Check tier for hiring limits only
  let effectiveTier = user.tier;
  if (user.promoTierUpgrade && user.promoExpiresAt) {
    if (new Date(user.promoExpiresAt) > new Date()) {
      effectiveTier = user.promoTierUpgrade;
    }
  }

  const isHired = bot.slug === 'boss-bot' || user.hiredBots.some(hb => hb.botId === bot.id);
  
  // Hiring limits
  const TIER_LIMITS: Record<number, number> = {
    1: 2,
    2: 5,
    3: 999,
  };
  const hireLimit = TIER_LIMITS[effectiveTier] || TIER_LIMITS[1];
  const hiresRemaining = hireLimit - user.hiredBots.length;

  const cvData = botCVs[slug] || {
    tagline: '"Your AI Specialist - Ready to Excel"',
    yearsExperience: '10+ Years of AI Expertise',
    availability: 'Available 24/7',
    skills: [
      { name: 'AI Assistance', level: 95 },
      { name: 'Problem Solving', level: 90 },
      { name: 'Knowledge Base', level: 92 },
    ],
    achievements: [
      '🏆 Served 100+ satisfied clients',
      '⭐ 5.0 star rating',
    ],
    whyHireMe: [
      'Expert knowledge at your fingertips',
      'Available whenever you need',
      'Personalized responses',
    ],
    testimonials: [],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <Link href="/bots">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Talent Directory
        </Button>
      </Link>

      {/* CV Header - Professional Resume Style */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
        <Card className="relative bg-gray-900/90 backdrop-blur-xl border-gray-800">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Photo */}
              <div className="md:col-span-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl blur-xl"></div>
                  <img
                    src={bot.imageUrl}
                    alt={bot.name}
                    className="relative w-full h-80 object-cover object-center rounded-2xl shadow-2xl"
                  />
                </div>
                
                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">{cvData.availability}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <UsersIcon className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">{bot._count.hiredBy} employers hired me</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">{bot._count.conversations} successful projects</span>
                  </div>
                  {bot.imageRecognition && (
                    <Badge className="bg-purple-600/90 text-white border border-purple-400/50">
                      📷 Vision Capable
                    </Badge>
                  )}
                </div>
              </div>

              {/* CV Content */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-5xl font-orbitron font-bold text-white mb-3">
                    {bot.name}
                  </h1>
                  <p className="text-2xl text-cyan-400 italic mb-4">
                    {cvData.tagline}
                  </p>
                  <p className="text-lg text-gray-300">
                    {bot.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 py-4 border-y border-gray-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">{cvData.yearsExperience}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-gray-400 ml-2">5.0/5.0</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {isHired ? (
                    <>
                      <Link href={`/chat?bot=${bot.slug}`}>
                        <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg py-6">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Start Working
                        </Button>
                      </Link>
                      <HireButton
                        botId={bot.id}
                        botName={bot.name}
                        isHired={true}
                        isDisabled={false}
                      />
                    </>
                  ) : (
                    <div className="col-span-2">
                      <HireButton
                        botId={bot.id}
                        botName={bot.name}
                        isHired={false}
                        canHire={hiresRemaining > 0}
                        disabledReason={hiresRemaining <= 0 ? "Payroll full! Expand your agency to recruit more talent." : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Core Competencies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cvData.skills.map((skill: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 font-medium">{skill.name}</span>
                <span className="text-cyan-400">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Career Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {cvData.achievements.map((achievement: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">{achievement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Hire Me */}
      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Why Recruit Me?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {cvData.whyHireMe.map((reason: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">{reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      {cvData.testimonials.length > 0 && (
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-purple-400" />
              Employer References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {cvData.testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="bg-gray-800/50 p-6 rounded-xl">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Shop - Only for hired bots */}
      {isHired && (
        <BotUpgradeShop
          botId={bot.id}
          botName={bot.name}
          availableUpgrades={{
            imageRecognition: bot.imageRecognition,
            voiceResponse: bot.voiceResponse,
            fileUpload: bot.fileUpload,
            webSearch: bot.webSearch,
            scheduling: bot.scheduling,
            dataExport: bot.dataExport,
          }}
        />
      )}

      {/* Final CTA */}
      {!isHired && (
        <Card className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-orange-900/50 border-purple-500/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-orbitron font-bold text-white mb-4">
              Ready to Add {bot.name} to Your Team?
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Join {bot._count.hiredBy} other smart employers who've already recruited this talent!
            </p>
            <HireButton
              botId={bot.id}
              botName={bot.name}
              isHired={false}
              canHire={hiresRemaining > 0}
              disabledReason={hiresRemaining <= 0 ? "Payroll full! Expand your agency." : undefined}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

