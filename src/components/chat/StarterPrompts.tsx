'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface StarterPromptsProps {
  botSlug: string;
  onPromptClick: (prompt: string) => void;
}

const STARTER_PROMPTS: Record<string, string[]> = {
  'apply-bot': [
    'Help me create a CV for a Software Engineer position',
    'Review my CV and suggest improvements',
    'Write a cover letter for [Company Name] - [Role]',
    'Tailor my CV for this job description: [paste description]',
  ],
};

export function StarterPrompts({ botSlug, onPromptClick }: StarterPromptsProps) {
  const prompts = STARTER_PROMPTS[botSlug];
  
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      <p className="text-sm text-gray-400 font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        Quick Start:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-left h-auto py-3 px-4 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-gray-300 hover:text-white transition-all"
            onClick={() => onPromptClick(prompt)}
          >
            <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0 text-cyan-400" />
            <span className="text-sm">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

