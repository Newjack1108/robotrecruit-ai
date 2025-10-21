'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function BotAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Boss Bot. Tell me what you need help with, and I'll recommend the perfect bot for you!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/bot-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Boss Bot Image */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full"></div>
          <img
            src="/bots/boss-bot.png"
            alt="Boss Bot"
            className="relative w-48 h-48 object-cover object-top rounded-full border-4 border-cyan-500/50 shadow-2xl"
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto border border-cyan-500/20">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' ? (
              <div className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me which bot is right for you..."
            className="flex-1 bg-gray-900/50 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400 rounded-xl h-12"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 rounded-xl h-12"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          💡 Try: "I need help with my business" or "I'm starting beekeeping"
        </p>
      </div>
    </div>
  );
}

