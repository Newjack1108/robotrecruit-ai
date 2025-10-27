'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getPlatformComposeUrl, SocialPlatform } from '@/lib/social-media-parser';

interface SocialMediaActionsProps {
  content: string;
  platform: SocialPlatform;
  hashtags?: string[];
  onCopySuccess?: () => void;
}

export function SocialMediaActions({ 
  content, 
  platform, 
  hashtags = [],
  onCopySuccess 
}: SocialMediaActionsProps) {
  const [copied, setCopied] = useState(false);

  // Combine content with hashtags if they're separate
  const fullContent = hashtags.length > 0 && !content.includes(hashtags[0])
    ? `${content}\n\n${hashtags.join(' ')}`
    : content;

  /**
   * Copy post to clipboard
   */
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  }

  /**
   * Open platform compose page
   */
  function openPlatform() {
    const url = getPlatformComposeUrl(platform, fullContent);
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Get platform button config
   */
  function getPlatformButton() {
    switch (platform) {
      case 'twitter':
        return {
          label: 'Open in Twitter/X',
          emoji: '🐦',
          color: 'border-blue-400/50 hover:bg-blue-400/10',
        };
      case 'linkedin':
        return {
          label: 'Open in LinkedIn',
          emoji: '💼',
          color: 'border-blue-600/50 hover:bg-blue-600/10',
        };
      case 'facebook':
        return {
          label: 'Open in Facebook',
          emoji: '📘',
          color: 'border-blue-500/50 hover:bg-blue-500/10',
        };
      case 'instagram':
        return {
          label: 'Open Instagram',
          emoji: '📸',
          color: 'border-pink-500/50 hover:bg-pink-500/10',
        };
      case 'threads':
        return {
          label: 'Open Threads',
          emoji: '🧵',
          color: 'border-purple-500/50 hover:bg-purple-500/10',
        };
      default:
        return {
          label: 'Open Platform',
          emoji: '🌐',
          color: 'border-gray-500/50 hover:bg-gray-500/10',
        };
    }
  }

  const platformButton = getPlatformButton();

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Copy to Clipboard - Always Available */}
      <Button 
        onClick={copyToClipboard}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Post
          </>
        )}
      </Button>
      
      {/* Platform-Specific Button */}
      {getPlatformComposeUrl(platform, fullContent) && (
        <Button 
          onClick={openPlatform}
          variant="outline"
          className={platformButton.color}
        >
          <span className="mr-2">{platformButton.emoji}</span>
          {platformButton.label}
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      )}
      
      {/* Additional Quick Access Buttons for Common Platforms */}
      {platform === 'general' && (
        <>
          <Button 
            onClick={() => window.open(getPlatformComposeUrl('twitter', fullContent), '_blank')}
            variant="outline"
            className="border-blue-400/50 hover:bg-blue-400/10"
            size="sm"
          >
            🐦 Twitter
          </Button>
          <Button 
            onClick={() => window.open(getPlatformComposeUrl('linkedin', fullContent), '_blank')}
            variant="outline"
            className="border-blue-600/50 hover:bg-blue-600/10"
            size="sm"
          >
            💼 LinkedIn
          </Button>
          <Button 
            onClick={() => window.open(getPlatformComposeUrl('facebook', fullContent), '_blank')}
            variant="outline"
            className="border-blue-500/50 hover:bg-blue-500/10"
            size="sm"
          >
            📘 Facebook
          </Button>
        </>
      )}
    </div>
  );
}

