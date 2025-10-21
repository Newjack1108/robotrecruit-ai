import { Bot, MessageSquare, Users, Zap, Sparkles } from 'lucide-react';

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
    title: 'Hire Your First Bot',
    description: 'These bots are ready to work for you! Click "HIRE NOW" on any bot to add them to your team. Try the Bee Bot - it knows everything about beekeeping!',
    target: '.unemployed-bots-section', // Add this class to unemployed bots section
    position: 'top',
    action: 'none',
    icon: Bot,
    nextButtonText: 'Got it!',
  },
  {
    id: 4,
    title: 'Start Chatting',
    description: 'Once hired, click "START SHIFT" to chat with your bots. They can answer questions, help with tasks, and even use special power-ups!',
    target: '[href="/chat"]', // Chat link in nav
    position: 'bottom',
    action: 'none',
    icon: MessageSquare,
    nextButtonText: 'Cool!',
  },
  {
    id: 5,
    title: 'Join the Community',
    description: 'Connect with other users in our community forum! Share tips, ask questions, and learn from fellow bot recruiters.',
    target: '[href="/community"]', // Community link in nav
    position: 'bottom',
    action: 'none',
    icon: Users,
    nextButtonText: 'Awesome!',
  },
  {
    id: 6,
    title: 'Power-Ups & Upgrades',
    description: "As you use your bots, you'll unlock power-ups like web search, voice input, and file uploads. Check your tier badge to see what's available!",
    target: '[href="/subscription"]', // Tier badge link
    position: 'bottom',
    action: 'none',
    icon: Zap,
    nextButtonText: 'Got it!',
  },
  {
    id: 7,
    title: "You're All Set! 🎉",
    description: "That's it! You're ready to start recruiting and chatting with your AI bot workforce. Have fun and don't hesitate to explore!",
    position: 'center',
    action: 'none',
    icon: Sparkles,
    nextButtonText: 'Start Recruiting!',
  },
];

