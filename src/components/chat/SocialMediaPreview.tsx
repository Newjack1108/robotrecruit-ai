'use client';

import { SocialPlatform, PLATFORM_LIMITS, getCharacterLimitStatus } from '@/lib/social-media-parser';

interface SocialMediaPreviewProps {
  content: string;
  platform: SocialPlatform;
  hashtags?: string[];
  suggestedTime?: string;
}

export function SocialMediaPreview({ 
  content, 
  platform, 
  hashtags = [],
  suggestedTime 
}: SocialMediaPreviewProps) {
  const characterCount = content.length;
  const limit = PLATFORM_LIMITS[platform];
  const status = getCharacterLimitStatus(characterCount, platform);

  /**
   * Get platform display name and color
   */
  function getPlatformStyle() {
    switch (platform) {
      case 'twitter':
        return {
          name: 'Twitter/X',
          emoji: '🐦',
          color: 'from-blue-400/20 to-blue-600/20',
          borderColor: 'border-blue-400/30',
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          emoji: '💼',
          color: 'from-blue-500/20 to-blue-700/20',
          borderColor: 'border-blue-500/30',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          emoji: '📘',
          color: 'from-blue-400/20 to-blue-500/20',
          borderColor: 'border-blue-400/30',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          emoji: '📸',
          color: 'from-pink-400/20 to-purple-500/20',
          borderColor: 'border-pink-400/30',
        };
      case 'threads':
        return {
          name: 'Threads',
          emoji: '🧵',
          color: 'from-purple-400/20 to-purple-600/20',
          borderColor: 'border-purple-400/30',
        };
      default:
        return {
          name: 'Social Media',
          emoji: '🌐',
          color: 'from-gray-400/20 to-gray-600/20',
          borderColor: 'border-gray-400/30',
        };
    }
  }

  const platformStyle = getPlatformStyle();

  /**
   * Get character count color
   */
  function getCharCountColor() {
    if (status === 'over') return 'text-red-400';
    if (status === 'warning') return 'text-yellow-400';
    return 'text-green-400';
  }

  return (
    <div className={`bg-gradient-to-br ${platformStyle.color} border ${platformStyle.borderColor} rounded-lg p-4 space-y-3`}>
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{platformStyle.emoji}</span>
          <div>
            <h4 className="text-sm font-semibold text-white">{platformStyle.name} Post</h4>
            {suggestedTime && (
              <p className="text-xs text-gray-400">Best time: {suggestedTime}</p>
            )}
          </div>
        </div>
        
        {/* Character Count */}
        <div className="text-right">
          <div className={`text-lg font-bold font-mono ${getCharCountColor()}`}>
            {characterCount}/{limit}
          </div>
          <p className="text-xs text-gray-400">
            {status === 'over' ? 'Over limit!' : status === 'warning' ? 'Near limit' : 'Good'}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, idx) => (
            <span 
              key={idx}
              className="inline-block bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Platform Tips */}
      <div className="pt-2 border-t border-gray-700/50">
        <p className="text-xs text-gray-400">
          {platform === 'twitter' && '💡 Keep it concise and punchy for maximum engagement'}
          {platform === 'linkedin' && '💡 Professional tone works best - include a call to action'}
          {platform === 'facebook' && '💡 Conversational and engaging - ask questions'}
          {platform === 'instagram' && '💡 Visual-focused - add emojis and line breaks'}
          {platform === 'threads' && '💡 Authentic and conversational - start discussions'}
          {platform === 'general' && '💡 Adapt your tone based on the platform you choose'}
        </p>
      </div>
    </div>
  );
}

