import { Bot, MessageSquare, Users, Zap, Sparkles, Gamepad2, Trophy, Flame, Target } from 'lucide-react';

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'none';
  icon: any; // Lucide icon component
  nextButtonText?: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to RobotRecruit.AI! 🤖',
    description: "Let's get you started with a quick tour of your new bot workforce! This will only take a minute.",
    position: 'center',
    action: 'none',
    icon: Sparkles,
    nextButtonText: "Let's Go!",
  },
  {
    id: 2,
    title: 'Your Bot Dashboard',
    description: "This is your command center! Here you'll see all your hired bots and available bots ready to recruit.",
    target: '.dashboard-content', // Add this class to dashboard main content
    position: 'center',
    action: 'none',
    icon: Bot,
    nextButtonText: 'Next',
  },
  {
    id: 3,
    title: 'Daily Challenges & Streaks 🔥',
    description: 'Complete daily challenges to earn points and build your streak! Check in every day for bonus rewards. The longer your streak, the bigger the bonuses!',
    target: '.daily-challenge-card', // Daily challenge card on dashboard
    position: 'top',
    action: 'none',
    icon: Flame,
    nextButtonText: 'Nice!',
  },
  {
    id: 4,
    title: 'Hire Your First Bot',
    description: 'These bots are ready to work for you! Click "HIRE NOW" on any bot to add them to your team. Try the Bee Bot - it knows everything about beekeeping!',
    target: '.unemployed-bots-section', // Add this class to unemployed bots section
    position: 'top',
    action: 'none',
    icon: Bot,
    nextButtonText: 'Got it!',
  },
  {
    id: 5,
    title: 'Start Chatting',
    description: 'Once hired, click "START SHIFT" to chat with your bots. They can answer questions, help with tasks, and even use special power-ups!',
    target: '[href="/chat"]', // Chat link in nav
    position: 'bottom',
    action: 'none',
    icon: MessageSquare,
    nextButtonText: 'Cool!',
  },
  {
    id: 6,
    title: 'Play Arcade Games 🎮',
    description: 'Head to the Arcade to play fun games like Bot Memory, Bot Runner, Bot Battle Arena, and Bot Slots! Compete for high scores on the leaderboards!',
    target: '[href="/arcade"]', // Arcade link in nav
    position: 'bottom',
    action: 'none',
    icon: Gamepad2,
    nextButtonText: 'Sweet!',
  },
  {
    id: 7,
    title: 'Unlock Achievements 🏆',
    description: 'Earn achievements by using bots, completing challenges, and reaching milestones. Show off your best achievements in your showcase!',
    target: '[href="/profile"]', // Profile link
    position: 'bottom',
    action: 'none',
    icon: Trophy,
    nextButtonText: 'Amazing!',
  },
  {
    id: 8,
    title: 'Join the Community',
    description: 'Connect with other users in our community forum! Share tips, ask questions, view showcases, and learn from fellow bot recruiters.',
    target: '[href="/community"]', // Community link in nav
    position: 'bottom',
    action: 'none',
    icon: Users,
    nextButtonText: 'Awesome!',
  },
  {
    id: 9,
    title: 'Power-Ups & Upgrades',
    description: "You start with free power-up credits! Use them for advanced features like web search, voice input, and file uploads. Upgrade your tier for more capabilities!",
    target: '[href="/subscription"]', // Tier badge link
    position: 'bottom',
    action: 'none',
    icon: Zap,
    nextButtonText: 'Got it!',
  },
  {
    id: 10,
    title: "You're All Set! 🎉",
    description: "That's it! You're ready to start recruiting, chatting, gaming, and building your bot empire. Have fun exploring all the features!",
    position: 'center',
    action: 'none',
    icon: Sparkles,
    nextButtonText: 'Start Recruiting!',
  },
];

