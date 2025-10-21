'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BotAdvisor } from './BotAdvisor';

export function BotAdvisorToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="lg"
        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/50 hover:border-purple-400 text-white font-bold"
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        {isOpen ? 'Hide Advisor' : 'Need Help Choosing? Ask Boss Bot'}
        {isOpen ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
      </Button>

      {isOpen && (
        <div className="animate-in slide-in-from-top duration-300">
          <BotAdvisor />
        </div>
      )}
    </div>
  );
}


