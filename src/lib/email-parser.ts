/**
 * Email Parser Utility
 * Extracts structured email data from bot messages
 */

export interface ParsedEmail {
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
  isEmail: boolean;
}

/**
 * Parse email content from bot message
 * Supports various formats:
 * - JSON format: ```json { "to": "...", "subject": "...", "body": "..." } ```
 * - Structured format: To: ...\nSubject: ...\nBody: ...
 * - Natural format with clear email indicators
 */
export function parseEmailFromMessage(content: string): ParsedEmail {
  const result: ParsedEmail = {
    isEmail: false,
  };

  // Check if content contains email indicators
  const emailIndicators = [
    /(?:^|\n)to:\s*(.+?)(?:\n|$)/i,
    /(?:^|\n)subject:\s*(.+?)(?:\n|$)/i,
    /(?:^|\n)(?:email |message )?body:\s*/i,
    /here'?s (?:the |your )?email/i,
    /draft email/i,
  ];

  const hasEmailIndicators = emailIndicators.some(regex => regex.test(content));
  
  if (!hasEmailIndicators) {
    return result;
  }

  result.isEmail = true;

  // Try to parse JSON format first
  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const emailData = JSON.parse(jsonMatch[1]);
      return {
        to: emailData.to || emailData.To || '',
        cc: emailData.cc || emailData.CC || '',
        bcc: emailData.bcc || emailData.BCC || '',
        subject: emailData.subject || emailData.Subject || '',
        body: emailData.body || emailData.Body || emailData.message || '',
        isEmail: true,
      };
    } catch (e) {
      // Continue with other parsing methods
    }
  }

  // Parse structured format
  const toMatch = content.match(/(?:^|\n)to:\s*(.+?)(?:\n|$)/i);
  if (toMatch) result.to = toMatch[1].trim();

  const ccMatch = content.match(/(?:^|\n)cc:\s*(.+?)(?:\n|$)/i);
  if (ccMatch) result.cc = ccMatch[1].trim();

  const bccMatch = content.match(/(?:^|\n)bcc:\s*(.+?)(?:\n|$)/i);
  if (bccMatch) result.bcc = bccMatch[1].trim();

  const subjectMatch = content.match(/(?:^|\n)subject:\s*(.+?)(?:\n|$)/i);
  if (subjectMatch) result.subject = subjectMatch[1].trim();

  // Parse body - everything after "Body:" or similar markers
  const bodyMarkers = [
    /(?:^|\n)(?:email )?body:\s*\n?([\s\S]*?)(?:\n---|\n\n(?:Let me know|Feel free|Would you like)|\n\n\*|$)/i,
    /(?:^|\n)message:\s*\n?([\s\S]*?)(?:\n---|\n\n(?:Let me know|Feel free|Would you like)|\n\n\*|$)/i,
  ];

  for (const marker of bodyMarkers) {
    const bodyMatch = content.match(marker);
    if (bodyMatch) {
      result.body = bodyMatch[1]
        .trim()
        .replace(/^```\n?/, '')  // Remove opening code block
        .replace(/\n?```$/, '')  // Remove closing code block
        .replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      break;
    }
  }

  // If no explicit body found, try to extract from code blocks
  if (!result.body) {
    const codeBlockMatch = content.match(/```(?:text|email)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      result.body = codeBlockMatch[1].trim();
    }
  }

  // Clean up body - remove "To:", "Subject:" lines if they appear in body
  if (result.body) {
    result.body = result.body
      .replace(/^(?:To|Subject|CC|BCC):\s*.+?\n/gim, '')
      .trim();
  }

  return result;
}

/**
 * Check if a message likely contains an email
 */
export function isEmailMessage(content: string): boolean {
  const indicators = [
    /(?:^|\n)to:\s*.+/i,
    /(?:^|\n)subject:\s*.+/i,
    /here'?s (?:the |your )?(?:email|draft)/i,
    /i'?ve (?:drafted|written|composed) (?:an? )?email/i,
  ];

  return indicators.some(regex => regex.test(content));
}

