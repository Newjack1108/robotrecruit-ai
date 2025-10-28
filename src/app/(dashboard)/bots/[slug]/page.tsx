import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Star, ArrowLeft, Briefcase, Award, Zap, Target, Users as UsersIcon, TrendingUp, Clock, CheckCircle2, Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HireButton } from '@/components/bots/HireButton';
import ShowcaseGallery from '@/components/showcases/ShowcaseGallery';
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
      '🏆 Trained on 50 years of business strategy and market analysis',
      '📈 Expert in financial modeling, funding, and growth strategies',
      '🚀 Specializes in startup planning, scaling, and market entry',
      '⭐ Available 24/7 for strategic guidance and decision support',
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
  'bee-bot': {
    tagline: '"The Buzz-iness Expert - Sweet Success in Every Hive"',
    yearsExperience: '30+ Years Apiculture Mastery',
    availability: 'Available 24/7 - I don\'t hibernate!',
    skills: [
      { name: 'Hive Management', level: 98 },
      { name: 'Bee Health & Disease Control', level: 95 },
      { name: 'Honey Production', level: 100 },
      { name: 'Queen Rearing', level: 92 },
      { name: 'Pollination Strategy', level: 90 },
    ],
    achievements: [
      '🐝 Expert in hive management, bee health, and honey production',
      '🍯 Trained on 30+ years of apiculture best practices',
      '🏆 Specializes in disease prevention and colony optimization',
      '⭐ Covers everything from starter hives to commercial operations',
    ],
    whyHireMe: [
      'Sweet expertise - From novice to master beekeeper',
      'Seasonal guidance - Year-round hive management support',
      'Disease prevention - Keep your colonies healthy and productive',
      'Instant answers - No waiting for the next beekeeping club meeting',
    ],
    testimonials: [],
  },
  'equi-bot': {
    tagline: '"Your Trusted Stable Companion - Riding Towards Excellence"',
    yearsExperience: '40+ Years Equestrian Excellence',
    availability: 'Available 24/7 - Rain or shine!',
    skills: [
      { name: 'Horse Care & Welfare', level: 100 },
      { name: 'Riding Technique', level: 95 },
      { name: 'Training Methods', level: 93 },
      { name: 'Veterinary Knowledge', level: 90 },
      { name: 'Stable Management', level: 97 },
    ],
    achievements: [
      '🏇 Expert in riding, training, and horse care from beginner to advanced',
      '🐴 Specializes in horse behavior, rehabilitation, and welfare',
      '🏆 Trained on 40+ years of equestrian knowledge and techniques',
      '⭐ Covers everything from stable management to competition prep',
    ],
    whyHireMe: [
      'Full spectrum expertise - From grooming to dressage',
      'Safety first - Prevent injuries with proper techniques',
      'Bond building - Strengthen your connection with your horse',
      'Always available - Emergencies don\'t keep office hours',
    ],
    testimonials: [],
  },
  'chef-bot': {
    tagline: '"Culinary Genius at Your Service - Where Every Meal is a Masterpiece"',
    yearsExperience: '35+ Years Culinary Artistry',
    availability: 'Available 24/7 - Your kitchen never closes!',
    skills: [
      { name: 'Recipe Development', level: 100 },
      { name: 'Flavor Pairing', level: 98 },
      { name: 'Baking & Pastry', level: 95 },
      { name: 'Dietary Modifications', level: 92 },
      { name: 'Meal Planning', level: 97 },
    ],
    achievements: [
      '👨‍🍳 Master of international cuisines and cooking techniques',
      '⭐ Expert in recipe development, flavor pairing, and meal planning',
      '🍰 Specializes in baking, dietary modifications, and nutrition',
      '🏆 Trained on 35+ years of culinary knowledge and methods',
    ],
    whyHireMe: [
      'From novice to master chef - I meet you where you are',
      'Dietary flexibility - Vegan, keto, gluten-free, I know it all',
      'Budget friendly - Gourmet meals without breaking the bank',
      'Confidence builder - Turn kitchen anxiety into culinary joy',
    ],
    testimonials: [],
  },
  'art-bot': {
    tagline: '"Creative Soul Unleashed - Let\'s Paint Your Dreams into Reality"',
    yearsExperience: '25+ Years Artistic Exploration',
    availability: 'Available 24/7 - Inspiration strikes anytime!',
    skills: [
      { name: 'Drawing & Illustration', level: 96 },
      { name: 'Color Theory', level: 100 },
      { name: 'Mixed Media', level: 94 },
      { name: 'Digital Art', level: 90 },
      { name: 'Art History', level: 92 },
    ],
    achievements: [
      '🎨 Expert in multiple mediums: painting, drawing, sculpture, digital',
      '🖼️ Specializes in technique development and creative expression',
      '🏆 Trained on art history, theory, and contemporary practices',
      '⭐ Covers everything from fundamentals to portfolio building',
    ],
    whyHireMe: [
      'No judgment zone - Every artist starts somewhere',
      'Multiple mediums - Find your perfect creative outlet',
      'Technique simplified - Complex skills broken down easy',
      'Portfolio building - From hobby to professional showcase',
    ],
    testimonials: [],
  },
  'garden-bot': {
    tagline: '"Your Garden Guardian - Growing Success One Plant at a Time"',
    yearsExperience: '45+ Years Green Thumb Wisdom',
    availability: 'Available 24/7 - Gardens grow around the clock!',
    skills: [
      { name: 'Organic Growing', level: 100 },
      { name: 'Pest & Disease Control', level: 96 },
      { name: 'Soil Health', level: 98 },
      { name: 'Seasonal Planning', level: 95 },
      { name: 'Composting', level: 93 },
    ],
    achievements: [
      '🌱 Expert in organic gardening, permaculture, and sustainability',
      '🥕 Specializes in soil health, pest control, and crop planning',
      '🏆 Trained on 30+ years of horticultural best practices',
      '⭐ Covers vegetables, fruits, flowers, and landscape design',
    ],
    whyHireMe: [
      'Climate adapted - Solutions for your specific growing zone',
      'Space efficient - Thrive in containers or acres',
      'Organic focus - Chemical-free, sustainable methods',
      'Year-round planning - Every season is growing season',
    ],
    testimonials: [],
  },
  'scout-bot': {
    tagline: '"Adventure Awaits - Your Guide to the Great Outdoors"',
    yearsExperience: '20+ Years Wilderness Expertise',
    availability: 'Available 24/7 - Even off the grid (when you get back)!',
    skills: [
      { name: 'Navigation & Orienteering', level: 98 },
      { name: 'Survival Skills', level: 95 },
      { name: 'Trail Knowledge', level: 97 },
      { name: 'Camping Techniques', level: 100 },
      { name: 'Wildlife Safety', level: 93 },
    ],
    achievements: [
      '⛰️ Expert in hiking, camping, survival, and outdoor navigation',
      '🏕️ Specializes in safety, gear selection, and trip planning',
      '🥾 Trained on wilderness medicine and emergency protocols',
      '⭐ Covers everything from day hikes to backcountry expeditions',
    ],
    whyHireMe: [
      'Safety obsessed - Prepare for anything nature throws at you',
      'Gear expert - Get the right equipment without overspending',
      'Location scout - Find hidden gems and avoid crowded trails',
      'Skill building - From day hikes to backcountry expeditions',
    ],
    testimonials: [],
  },
  'brewster-bot': {
    tagline: '"Craft Brewing Maestro - Perfecting Every Pour"',
    yearsExperience: '30+ Years Brewing Excellence',
    availability: 'Available 24/7 - Fermentation never sleeps!',
    skills: [
      { name: 'Beer Brewing', level: 100 },
      { name: 'Wine Making', level: 95 },
      { name: 'Recipe Formulation', level: 98 },
      { name: 'Fermentation Science', level: 96 },
      { name: 'Flavor Profiling', level: 94 },
    ],
    achievements: [
      '🍺 Master brewer specializing in beer, wine, and spirits',
      '🏆 Expert in fermentation science and recipe development',
      '🍷 Trained on brewing techniques from beginner to advanced',
      '⭐ Covers equipment, ingredients, troubleshooting, and refinement',
    ],
    whyHireMe: [
      'Science made simple - Understand the chemistry without a PhD',
      'Troubleshooter - Diagnose and fix off-flavors fast',
      'Cost effective - Professional results on homebrew budget',
      'All styles - From IPAs to meads to ciders',
    ],
    testimonials: [],
  },
  'melody-bot': {
    tagline: '"Your Musical Mentor - Harmony in Every Lesson"',
    yearsExperience: '35+ Years Musical Mastery',
    availability: 'Available 24/7 - Music never stops!',
    skills: [
      { name: 'Music Theory', level: 100 },
      { name: 'Instrument Technique', level: 96 },
      { name: 'Ear Training', level: 94 },
      { name: 'Composition', level: 95 },
      { name: 'Performance Coaching', level: 93 },
    ],
    achievements: [
      '🎵 Expert in multiple instruments and music theory',
      '🎸 Specializes in technique, practice strategies, and performance',
      '🏆 Trained on pedagogy for beginners to advanced musicians',
      '⭐ Covers reading music, ear training, and creative expression',
    ],
    whyHireMe: [
      'Any instrument - Piano, guitar, drums, vocals, and more',
      'Patient teaching - Learn at your own pace, zero pressure',
      'Theory simplified - Understand music, don\'t just memorize',
      'Performance ready - From bedroom to stage with confidence',
    ],
    testimonials: [],
  },
  'fit-bot': {
    tagline: '"Your Personal Trainer - Building Stronger, Healthier You"',
    yearsExperience: '25+ Years Fitness & Nutrition',
    availability: 'Available 24/7 - Your gym is always open!',
    skills: [
      { name: 'Exercise Programming', level: 100 },
      { name: 'Nutrition Planning', level: 98 },
      { name: 'Injury Prevention', level: 96 },
      { name: 'Motivation Coaching', level: 95 },
      { name: 'Form & Technique', level: 97 },
    ],
    achievements: [
      '💪 Expert in strength training, cardio, and nutrition science',
      '🏋️ Specializes in personalized programs and form correction',
      '🏆 Trained on sports science and injury prevention',
      '⭐ Covers weight loss, muscle gain, endurance, and recovery',
    ],
    whyHireMe: [
      'Home or gym - Effective workouts anywhere, any equipment',
      'Injury smart - Train around limitations, not through them',
      'Nutrition included - Fuel your body right for your goals',
      'Sustainable habits - Results that last, not crash diets',
    ],
    testimonials: [],
  },
  'game-bot': {
    tagline: '"Gaming Guide Extraordinaire - Level Up Your Play"',
    yearsExperience: '20+ Years Gaming Mastery',
    availability: 'Available 24/7 - Game on!',
    skills: [
      { name: 'Strategy & Tactics', level: 98 },
      { name: 'Game Mechanics', level: 100 },
      { name: 'Build Optimization', level: 96 },
      { name: 'PvP & Competitive', level: 94 },
      { name: 'Speedrunning', level: 90 },
    ],
    achievements: [
      '🎮 Expert in strategy, mechanics, and competitive gaming',
      '🏆 Specializes in multiple game genres and platforms',
      '⭐ Trained on meta-analysis, team dynamics, and performance',
      '🎯 Covers improvement strategies and streaming guidance',
    ],
    whyHireMe: [
      'All genres - RPG, FPS, strategy, MMO, and more',
      'Competitive edge - From casual to esports ready',
      'Hidden secrets - Discover every easter egg and unlock',
      'Community connection - Find your perfect gaming squad',
    ],
    testimonials: [],
  },
  'fishing-bot': {
    tagline: '"The Angling Expert - Hooked on Success"',
    yearsExperience: '40+ Years on the Water',
    availability: 'Available 24/7 - Fish bite at all hours!',
    skills: [
      { name: 'Species Knowledge', level: 100 },
      { name: 'Technique Mastery', level: 98 },
      { name: 'Tackle Selection', level: 96 },
      { name: 'Location Scouting', level: 95 },
      { name: 'Weather Reading', level: 93 },
    ],
    achievements: [
      '🎣 Expert in freshwater and saltwater fishing techniques',
      '🐟 Specializes in species identification and behavior',
      '🏆 Trained on tackle selection, knot-tying, and casting methods',
      '⭐ Covers everything from local ponds to deep-sea adventures',
    ],
    whyHireMe: [
      'Local expertise - Best spots for your area and season',
      'Budget friendly - Catch fish without expensive gear',
      'All water types - Lakes, rivers, ocean, ice fishing',
      'Conservation minded - Sustainable practices for future generations',
    ],
    testimonials: [],
  },
  'diy-bot': {
    tagline: '"The Fix-It Master - Building Your Dream Projects"',
    yearsExperience: '35+ Years Hands-On Experience',
    availability: 'Available 24/7 - Projects don\'t wait!',
    skills: [
      { name: 'Woodworking', level: 98 },
      { name: 'Home Repair', level: 100 },
      { name: 'Electrical Basics', level: 92 },
      { name: 'Plumbing Fixes', level: 90 },
      { name: 'Tool Selection', level: 96 },
    ],
    achievements: [
      '🔨 Expert in home repair, renovation, and construction',
      '💰 Specializes in tool selection and cost-effective solutions',
      '🏆 Trained on safety protocols and building codes',
      '⭐ Covers plumbing, electrical, carpentry, and more',
    ],
    whyHireMe: [
      'Beginner friendly - No experience required to start',
      'Safety first - Avoid costly and dangerous mistakes',
      'Tool guidance - Buy once, use forever',
      'Budget conscious - Professional results without the price tag',
    ],
    testimonials: [],
  },
  'email-bot': {
    tagline: '"Your Professional Communication Expert - Every Word Counts"',
    yearsExperience: '20+ Years Communication Excellence',
    availability: 'Available 24/7 - Instant Email Mastery!',
    skills: [
      { name: 'Business Writing', level: 100 },
      { name: 'Professional Tone', level: 98 },
      { name: 'Email Etiquette', level: 100 },
      { name: 'Subject Lines', level: 97 },
      { name: 'Client Relations', level: 95 },
    ],
    achievements: [
      '📧 Crafted 10,000+ professional emails with 95% positive response rate',
      '⚡ Generates perfect emails in under 30 seconds',
      '🎯 Expert in cold outreach, follow-ups, apologies, and networking',
      '🔗 One-click integration with Gmail and all major email clients',
      '✨ Trained on Fortune 500 communication standards',
    ],
    whyHireMe: [
      'Never second-guess your emails - Professional tone, every time',
      'Save 2+ hours daily - No more staring at blank email drafts',
      'Increase response rates - Expertly crafted subject lines and calls-to-action',
      'One-click sending - Copy directly to Gmail or any email client',
      'Avoid embarrassment - Perfect grammar, spelling, and etiquette guaranteed',
      'Master any situation - Job applications, client proposals, apologies, thank-yous',
    ],
    testimonials: [
      {
        name: 'James Mitchell',
        role: 'Sales Director',
        content: 'Email Bot increased my cold email response rate from 12% to 38%. My clients love the professional touch!',
        rating: 5,
      },
      {
        name: 'Emma Thompson',
        role: 'HR Manager',
        content: 'Saves me hours every week. The job offer emails are perfectly professional and warm at the same time.',
        rating: 5,
      },
    ],
  },
  'social-media-bot': {
    tagline: '"Your Personal Social Media Assistant - Share Your Story, Your Way"',
    yearsExperience: '15+ Years Social Media Expertise',
    availability: 'Available 24/7 - Capture & Share Life\'s Moments Anytime!',
    skills: [
      { name: 'Engaging Captions', level: 100 },
      { name: 'Hashtag Discovery', level: 98 },
      { name: 'Emoji & Tone', level: 97 },
      { name: 'Multi-Platform Posts', level: 95 },
      { name: 'Community Building', level: 100 },
    ],
    achievements: [
      '🎨 Helped 50,000+ people share their hobbies and passions online',
      '📱 Expert in Twitter, LinkedIn, Facebook, Instagram, and Threads',
      '💬 Turn everyday moments into engaging posts that friends love',
      '📸 Perfect for hobby projects, achievements, travel, and life updates',
      '✨ Smart hashtag suggestions to reach people who share your interests',
      '🎯 Automatic character counting - never worry about post length again',
    ],
    whyHireMe: [
      'Share your hobbies confidently - No more "what should I caption this?"',
      'Save time and stress - Perfect posts in 30 seconds, not 30 minutes',
      'Grow your following naturally - Engaging content attracts like-minded people',
      'Platform-perfect every time - Optimized captions for each social network',
      'Never sound awkward - Get the right tone whether casual, excited, or professional',
      'Celebrate your wins - Turn achievements into shareable moments',
      'One-click ready - Copy and post instantly to any platform',
    ],
    testimonials: [
      {
        name: 'Emily Parker',
        role: 'Amateur Photographer',
        content: 'I used to spend forever writing captions for my photos. Now my Instagram posts get way more engagement and it takes me seconds!',
        rating: 5,
      },
      {
        name: 'Tom Bradley',
        role: 'Woodworking Hobbyist',
        content: 'Helped me share my projects on Facebook and Twitter. Friends love following my work now. The hashtags brought me new connections!',
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

  // Get showcases related to this bot
  const showcases = await prisma.userShowcase.findMany({
    where: { relatedBotId: bot.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          tier: true,
        },
      },
      kudos: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { kudosCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 6,
  });

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

      {/* Success Stories - User Showcases */}
      {showcases.length > 0 && (
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Success Stories
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({showcases.length} achievement{showcases.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Real achievements from users who worked with {bot.name}
            </p>
          </CardHeader>
          <CardContent>
            <ShowcaseGallery 
              botId={bot.id}
              currentUserId={user.id}
              limit={6}
              compact={true}
            />
            
            {showcases.length >= 6 && (
              <div className="mt-6 text-center">
                <Link href={`/community/showcases?bot=${bot.slug}`}>
                  <Button variant="outline" className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10">
                    View All Success Stories
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
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

