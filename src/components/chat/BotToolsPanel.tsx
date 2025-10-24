'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChefBotTools } from './tools/ChefBotTools';
import { FishingBotTools } from './tools/FishingBotTools';
import { BeeBotTools } from './tools/BeeBotTools';

interface BotToolsPanelProps {
  botSlug: string;
  conversationId?: string;
}

// Map of bot slugs to their tool components
const BOT_TOOLS_MAP: { [key: string]: boolean } = {
  'chef-bot': true,
  'fishing-bot': true,
  'bee-bot': true,
};

export function BotToolsPanel({ botSlug, conversationId }: BotToolsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [toolsData, setToolsData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if this bot has tools
  const hasTools = BOT_TOOLS_MAP[botSlug];
  
  // Debug logging
  console.log('BotToolsPanel - botSlug:', botSlug);
  console.log('BotToolsPanel - hasTools:', hasTools);
  console.log('BotToolsPanel - conversationId:', conversationId);

  useEffect(() => {
    if (conversationId && hasTools) {
      loadToolsData();
    }
  }, [conversationId, hasTools]);

  const loadToolsData = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/tools`);
      if (response.ok) {
        const data = await response.json();
        
        // Group tool data by toolType
        const grouped: any = {};
        data.forEach((item: any) => {
          grouped[item.toolType] = item.data;
        });
        
        setToolsData(grouped);
      }
    } catch (error) {
      console.error('Error loading tools data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = async (toolType: string, data: any) => {
    if (!conversationId) return;
    
    try {
      // Check if this tool type already exists
      const response = await fetch(`/api/conversations/${conversationId}/tools`);
      if (!response.ok) return;
      
      const existingData = await response.json();
      const existingTool = existingData.find((item: any) => item.toolType === toolType);
      
      if (existingTool) {
        // Update existing
        await fetch(`/api/conversations/${conversationId}/tools`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingTool.id,
            data,
          }),
        });
      } else {
        // Create new
        await fetch(`/api/conversations/${conversationId}/tools`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolType,
            data,
            isActive: true,
          }),
        });
      }
      
      // Update local state
      setToolsData((prev: any) => ({
        ...prev,
        [toolType]: data,
      }));
    } catch (error) {
      console.error('Error saving tool data:', error);
    }
  };

  if (!hasTools) {
    return null;
  }

  if (!conversationId) {
    return (
      <div className="border-t border-gray-700 bg-gray-900/30 p-4">
        <div className="text-center text-gray-500 text-sm">
          Start a conversation to use bot-specific tools
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-700 bg-gray-900/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-white">Bot Tools</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {botSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-700">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              Loading tools...
            </div>
          ) : (
            <>
              {botSlug === 'chef-bot' && (
                <ChefBotTools
                  conversationId={conversationId}
                  onDataChange={handleDataChange}
                  initialData={{
                    timers: toolsData.timers,
                    ingredients: toolsData.ingredients,
                    recipe: toolsData.recipe,
                  }}
                />
              )}
              {botSlug === 'fishing-bot' && (
                <FishingBotTools
                  conversationId={conversationId}
                  onDataChange={handleDataChange}
                  initialData={{
                    venue: toolsData.venue,
                    weather: toolsData.weather,
                    catches: toolsData.catches,
                  }}
                />
              )}
              {botSlug === 'bee-bot' && (
                <BeeBotTools
                  conversationId={conversationId}
                  onDataChange={handleDataChange}
                  initialData={{
                    inspections: toolsData.inspections,
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

