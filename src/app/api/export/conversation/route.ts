import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { ConversationPDF } from '@/lib/pdf-generator';
import { summarizeConversation } from '@/lib/conversation-summarizer';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const format = searchParams.get('format') || 'md'; // 'md' or 'pdf'
    const type = searchParams.get('type') || 'full'; // 'summary' or 'full'

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    // Get conversation with messages
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id, // Ensure user owns this conversation
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        bot: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            dataExport: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to Data Export power-up
    const hasDataExportPowerUp = conversation.bot.dataExport;
    
    // Check if power-up was active in this conversation
    const activePowerUps = Array.isArray(conversation.activePowerUps) 
      ? conversation.activePowerUps 
      : [];
    const wasDataExportActive = activePowerUps.includes('dataExport');

    // Verify access
    if (!hasDataExportPowerUp || !wasDataExportActive) {
      return NextResponse.json(
        { error: 'Data Export power-up not active for this conversation' },
        { status: 403 }
      );
    }

    // Generate report based on format
    if (format === 'pdf') {
      // Generate AI summary if requested
      let summary = undefined;
      if (type === 'summary') {
        console.log('[EXPORT] Generating AI summary for conversation:', conversationId);
        summary = await summarizeConversation(
          conversation.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          conversation.bot.name
        );
      }

      // Convert avatar URL to absolute URL for PDF rendering
      const origin = req.nextUrl.origin;
      const conversationWithAbsoluteUrl = {
        ...conversation,
        bot: {
          ...conversation.bot,
          avatarUrl: conversation.bot.avatarUrl 
            ? conversation.bot.avatarUrl.startsWith('http') 
              ? conversation.bot.avatarUrl 
              : `${origin}${conversation.bot.avatarUrl}`
            : null
        }
      };

      // Generate PDF
      const pdfBuffer = await renderToBuffer(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.createElement(ConversationPDF, { 
          conversation: conversationWithAbsoluteUrl, 
          user,
          summary,
          includeSummary: type === 'summary'
        }) as any
      );

      const filename = type === 'summary' 
        ? `conversation-summary-${conversation.bot.slug}-${new Date().toISOString().split('T')[0]}.pdf`
        : `conversation-${conversation.bot.slug}-${new Date().toISOString().split('T')[0]}.pdf`;

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Generate markdown report
      const markdown = generateMarkdownReport(conversation, user);

      // Return as downloadable file
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="conversation-${conversation.bot.slug}-${new Date().toISOString().split('T')[0]}.md"`,
        },
      });
    }

  } catch (error) {
    console.error('[EXPORT_CONVERSATION_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    );
  }
}

function generateMarkdownReport(conversation: { bot: { name: string }; messages: Array<{ role: string; content: string; createdAt: Date }>; createdAt: Date; updatedAt: Date }, user: { email: string }) {
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let markdown = `# Conversation Report\n\n`;
  markdown += `**Bot:** ${conversation.bot.name}\n`;
  markdown += `**User:** ${user.email}\n`;
  markdown += `**Date:** ${date}\n`;
  markdown += `**Total Messages:** ${conversation.messages.length}\n\n`;
  markdown += `---\n\n`;

  // Add summary section
  markdown += `## Summary\n\n`;
  markdown += `This conversation contains ${conversation.messages.length} messages `;
  markdown += `between ${user.email} and ${conversation.bot.name}.\n\n`;

  const userMessages = conversation.messages.filter((m) => m.role === 'user').length;
  const botMessages = conversation.messages.filter((m) => m.role === 'assistant').length;
  
  markdown += `- User messages: ${userMessages}\n`;
  markdown += `- Bot responses: ${botMessages}\n`;
  markdown += `- Started: ${new Date(conversation.createdAt).toLocaleString()}\n`;
  markdown += `- Last updated: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;

  markdown += `---\n\n`;
  markdown += `## Conversation\n\n`;

  // Add all messages
  conversation.messages.forEach((message) => {
    const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (message.role === 'user') {
      markdown += `### 👤 User (${timestamp})\n\n`;
    } else {
      markdown += `### 🤖 ${conversation.bot.name} (${timestamp})\n\n`;
    }

    markdown += `${message.content}\n\n`;
  });

  markdown += `---\n\n`;
  markdown += `*Exported from RobotRecruit.AI on ${new Date().toLocaleString()}*\n`;

  return markdown;
}

