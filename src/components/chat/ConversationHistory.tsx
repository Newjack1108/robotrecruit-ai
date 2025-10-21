'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

interface ConversationHistoryProps {
  botId: string;
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationHistory({
  botId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [botId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations?botId=${botId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(conversations.filter(c => c.id !== conversationId));
        
        // If deleting current conversation, start a new one
        if (conversationId === currentConversationId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80">
        <h2 className="text-lg font-orbitron font-bold text-cyan-400 mb-3 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Conversation History
        </h2>
        
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-orbitron tracking-wide shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-pulse">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm mt-1 text-gray-500">Start chatting to create one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  conversation.id === currentConversationId
                    ? 'bg-cyan-600/20 border-2 border-cyan-500/70 shadow-lg shadow-cyan-500/20'
                    : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/40 hover:bg-gray-800/80 hover:shadow-md'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`text-sm font-semibold truncate ${
                      conversation.id === currentConversationId
                        ? 'text-cyan-300'
                        : 'text-white'
                    }`}>
                      {conversation.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  
                  <Button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-950/50 p-1 h-auto"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

