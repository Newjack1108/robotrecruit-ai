/**
 * Web Search Integration
 * Uses DuckDuckGo Instant Answer API (free, no API key needed)
 * For production, consider upgrading to Tavily, SerpAPI, or Brave Search API
 */

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export async function performWebSearch(query: string): Promise<string> {
  try {
    // Use DuckDuckGo Instant Answer API (free, no auth required)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      {
        headers: {
          'User-Agent': 'RobotRecruit-AI/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search API failed');
    }

    const data = await response.json();

    // Format the search results for the bot
    let searchContext = `[WEB SEARCH RESULTS for "${query}"]\n\n`;

    // Add abstract/answer if available
    if (data.Abstract) {
      searchContext += `Summary: ${data.Abstract}\n`;
      if (data.AbstractURL) {
        searchContext += `Source: ${data.AbstractURL}\n`;
      }
      searchContext += `\n`;
    }

    // Add related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      searchContext += `Related Information:\n`;
      data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
        if (topic.Text) {
          searchContext += `${index + 1}. ${topic.Text}\n`;
          if (topic.FirstURL) {
            searchContext += `   URL: ${topic.FirstURL}\n`;
          }
        }
      });
    }

    // If no results found, indicate that
    if (!data.Abstract && (!data.RelatedTopics || data.RelatedTopics.length === 0)) {
      searchContext = `[WEB SEARCH]: No specific results found for "${query}". Using existing knowledge.`;
    }

    return searchContext;

  } catch (error) {
    console.error('[WEB_SEARCH_ERROR]', error);
    return `[WEB SEARCH]: Search temporarily unavailable. Using existing knowledge.`;
  }
}

/**
 * Detect if a query might benefit from web search
 */
export function shouldPerformWebSearch(message: string): boolean {
  const webSearchIndicators = [
    // Explicit web search requests
    /\b(search|google|look up|find|web|internet|online)\b/i,
    // Current/recent events
    /\b(current|latest|recent|today|this week|this month|2024|2025)\b/i,
    // News and updates
    /\b(news|update|happening|going on)\b/i,
    // Weather
    /\b(weather|temperature|forecast)\b/i,
    // Stock/crypto prices
    /\b(price|stock|crypto|bitcoin|eth)\b/i,
    // Sports scores
    /\b(score|game|match|won|lost)\b/i,
    // Definitions that might be recent
    /\b(what is|who is|define)\b.*\b(new|latest)\b/i,
  ];

  return webSearchIndicators.some(pattern => pattern.test(message));
}

