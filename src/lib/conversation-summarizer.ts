import { openai } from './openai';

export interface ConversationSummary {
  executiveSummary: string;
  keyTopics: string[];
  mainTakeaways: string[];
  actionItems: string[];
}

/**
 * Generates an AI-powered summary of a conversation
 * @param messages - Array of conversation messages
 * @param botName - Name of the bot in the conversation
 * @returns Structured summary with bulletpoints
 */
export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>,
  botName: string
): Promise<ConversationSummary> {
  // Don't summarize very short conversations
  if (messages.length < 4) {
    return {
      executiveSummary: `Brief conversation with ${botName} containing ${messages.length} messages.`,
      keyTopics: ['Short conversation - see full transcript below'],
      mainTakeaways: [],
      actionItems: ['None'],
    };
  }

  // Build conversation context (limit to last 50 messages to avoid token limits)
  const recentMessages = messages.slice(-50);
  const conversationText = recentMessages
    .map((m) => `${m.role === 'user' ? 'User' : botName}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are analyzing a conversation between a user and ${botName}, an AI assistant. Please provide a structured summary.

Conversation:
${conversationText}

Please provide:
1. A brief executive summary (2-3 sentences that captures the essence of the conversation)
2. Key topics discussed (3-5 main topics as bulletpoints)
3. Main takeaways/insights (3-5 important points the user learned or discussed)
4. Action items or next steps mentioned (specific tasks or recommendations, or "None" if not applicable)

Format your response as JSON with this structure:
{
  "executiveSummary": "...",
  "keyTopics": ["topic 1", "topic 2", ...],
  "mainTakeaways": ["takeaway 1", "takeaway 2", ...],
  "actionItems": ["action 1", "action 2", ...] or ["None"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        {
          role: 'system',
          content: 'You are a professional conversation analyst. Provide clear, concise summaries in JSON format. Be specific and actionable.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent summaries
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    const summary = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      executiveSummary: summary.executiveSummary || 'No summary available.',
      keyTopics: Array.isArray(summary.keyTopics) ? summary.keyTopics : [],
      mainTakeaways: Array.isArray(summary.mainTakeaways) ? summary.mainTakeaways : [],
      actionItems: Array.isArray(summary.actionItems) ? summary.actionItems : ['None'],
    };
  } catch (error) {
    console.error('[SUMMARIZATION_ERROR]', error);
    // Return fallback summary
    return {
      executiveSummary: `This conversation contains ${messages.length} messages with ${botName}.`,
      keyTopics: ['Conversation details available in full transcript below'],
      mainTakeaways: [],
      actionItems: ['None'],
    };
  }
}


