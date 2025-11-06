'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChefBotTools } from './tools/ChefBotTools';
import { FishingBotTools } from './tools/FishingBotTools';
import { BeeBotTools } from './tools/BeeBotTools';
import { ApplyBotTools } from './tools/ApplyBotTools';

interface BotToolsPanelProps {
  botSlug: string;
  conversationId?: string;
  isVisible?: boolean;
  onClose?: () => void;
  itemsToAdd?: string[]; // For Chef Bot - items to add to shopping list
}

// Map of bot slugs to their tool components
const BOT_TOOLS_MAP: { [key: string]: boolean } = {
  'chef-bot': true,
  'fishing-bot': true,
  'bee-bot': true,
  'apply-bot': true,
};

export function BotToolsPanel({ botSlug, conversationId, isVisible = true, onClose, itemsToAdd }: BotToolsPanelProps) {
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

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg">
            <Wrench className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white font-orbitron">Bot Tools</h3>
            <p className="text-xs text-gray-400">
              {botSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Close Tools"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

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
                    shoppingList: toolsData.shoppingList,
                    recipe: toolsData.recipe,
                  }}
                  itemsToAdd={itemsToAdd}
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
              {botSlug === 'apply-bot' && (
                <ApplyBotTools
                  conversationId={conversationId}
                  onDataChange={handleDataChange}
                  initialData={{
                    cv_profile: toolsData.cv_profile,
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

