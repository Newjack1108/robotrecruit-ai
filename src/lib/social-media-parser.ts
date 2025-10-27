/**
 * Social Media Parser Utility
 * Extracts structured social media post data from bot messages
 */

export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'threads' | 'general';

export interface ParsedSocialPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  characterCount: number;
  isSocialPost: boolean;
  suggestedTime?: string;
}

/**
 * Platform character limits
 */
export const PLATFORM_LIMITS = {
  twitter: 280,
  linkedin: 3000,
  facebook: 63206,
  instagram: 2200,
  threads: 500,
  general: 1000,
};

/**
 * Parse social media post from bot message
 */
export function parseSocialPostFromMessage(content: string): ParsedSocialPost {
  const result: ParsedSocialPost = {
    platform: 'general',
    content: '',
    hashtags: [],
    characterCount: 0,
    isSocialPost: false,
  };

  // Check if content contains social media indicators
  const socialIndicators = [
    /platform:\s*(twitter|linkedin|facebook|instagram|threads)/i,
    /(?:write|create|draft) (?:a |an )?(?:twitter|linkedin|facebook|instagram|social media) post/i,
    /(?:here'?s|i'?ve (?:written|created|drafted)) (?:a |your )?(?:social media )?post/i,
    /hashtags?:/i,
  ];

  const hasSocialIndicators = socialIndicators.some(regex => regex.test(content));
  
  if (!hasSocialIndicators) {
    return result;
  }

  result.isSocialPost = true;

  // Try to parse JSON format first
  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const postData = JSON.parse(jsonMatch[1]);
      return {
        platform: postData.platform?.toLowerCase() || 'general',
        content: postData.content || postData.text || '',
        hashtags: Array.isArray(postData.hashtags) ? postData.hashtags : [],
        characterCount: (postData.content || postData.text || '').length,
        isSocialPost: true,
      };
    } catch (e) {
      // Continue with other parsing methods
    }
  }

  // Parse platform
  const platformMatch = content.match(/platform:\s*(twitter|linkedin|facebook|instagram|threads|x)/i);
  if (platformMatch) {
    const platform = platformMatch[1].toLowerCase();
    result.platform = platform === 'x' ? 'twitter' : platform as SocialPlatform;
  }

  // Parse content - look for various markers
  const contentMarkers = [
    /(?:^|\n)(?:post )?content:\s*\n?([\s\S]*?)(?:\n(?:hashtags?:|---)|$)/i,
    /(?:^|\n)text:\s*\n?([\s\S]*?)(?:\n(?:hashtags?:|---)|$)/i,
    /(?:here'?s (?:the |your )?post:?)\s*\n([\s\S]*?)(?:\n(?:hashtags?:|---)|$)/i,
  ];

  for (const marker of contentMarkers) {
    const contentMatch = content.match(marker);
    if (contentMatch) {
      result.content = contentMatch[1]
        .trim()
        .replace(/^```\n?/, '')  // Remove opening code block
        .replace(/\n?```$/, '')  // Remove closing code block
        .replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      break;
    }
  }

  // If no explicit content marker, try to extract from code blocks
  if (!result.content) {
    const codeBlockMatch = content.match(/```(?:text|post)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      result.content = codeBlockMatch[1].trim();
    }
  }

  // If still no content, try to extract everything between platform and hashtags
  if (!result.content) {
    const betweenMatch = content.match(/(?:platform:.*?\n|post:.*?\n)([\s\S]*?)(?:\nhashtags?:|$)/i);
    if (betweenMatch) {
      result.content = betweenMatch[1].trim();
    }
  }

  // Parse hashtags
  const hashtagMatches = content.match(/hashtags?:\s*([^\n]+)/i);
  if (hashtagMatches) {
    result.hashtags = hashtagMatches[1]
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.trim());
  }

  // Extract hashtags from content if not explicitly listed
  if (result.hashtags.length === 0 && result.content) {
    const contentHashtags = result.content.match(/#\w+/g);
    if (contentHashtags) {
      result.hashtags = contentHashtags;
    }
  }

  // Calculate character count
  result.characterCount = result.content.length;

  // Parse suggested time if present
  const timeMatch = content.match(/(?:suggested |best )?time:\s*([^\n]+)/i);
  if (timeMatch) {
    result.suggestedTime = timeMatch[1].trim();
  }

  return result;
}

/**
 * Check if a message likely contains a social media post
 */
export function isSocialMediaPost(content: string): boolean {
  const indicators = [
    /platform:\s*(?:twitter|linkedin|facebook|instagram)/i,
    /(?:here'?s|i'?ve (?:written|created)) (?:a |your )?(?:social media )?post/i,
    /hashtags?:/i,
    /(?:twitter|linkedin|facebook|instagram) post/i,
  ];

  return indicators.some(regex => regex.test(content));
}

/**
 * Get platform-specific URL for composing
 */
export function getPlatformComposeUrl(platform: SocialPlatform, content: string): string {
  const encodedContent = encodeURIComponent(content);
  
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedContent}`;
    case 'linkedin':
      // LinkedIn doesn't have a direct compose URL with pre-filled text
      return 'https://www.linkedin.com/feed/';
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?quote=${encodedContent}`;
    case 'instagram':
    case 'threads':
      // Instagram web doesn't support pre-filled posts
      return 'https://www.instagram.com/';
    default:
      return '';
  }
}

/**
 * Get character limit warning level
 */
export function getCharacterLimitStatus(
  characterCount: number,
  platform: SocialPlatform
): 'safe' | 'warning' | 'over' {
  const limit = PLATFORM_LIMITS[platform];
  
  if (characterCount > limit) {
    return 'over';
  } else if (characterCount > limit * 0.9) {
    return 'warning';
  }
  
  return 'safe';
}

