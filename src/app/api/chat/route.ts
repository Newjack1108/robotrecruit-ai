import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMessage, createThread } from '@/lib/openai';
import { performWebSearch, shouldPerformWebSearch } from '@/lib/web-search';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { message, botId, conversationId, imageUrl, fileId, activePowerUps } = body;

    if (!message || !botId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate effective tier (considering promo upgrades)
    let effectiveTier = user.tier;
    if (user.promoTierUpgrade && user.promoExpiresAt) {
      if (new Date(user.promoExpiresAt) > new Date()) {
        effectiveTier = user.promoTierUpgrade;
      }
    }

    // Check if user is a free user (tier 1, no subscription, no active promo)
    const isFreeUser = effectiveTier === 1 && !user.stripeCustomerId;
    
    if (isFreeUser) {
      const now = new Date();
      
      // Initialize trial if not set (for existing users)
      if (!user.trialEndsAt) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            trialEndsAt: new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from account creation
          },
        });
        user.trialEndsAt = new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      
      // Check if trial has expired
      if (user.trialEndsAt && now > user.trialEndsAt) {
        return new NextResponse(
          JSON.stringify({
            error: 'TRIAL_EXPIRED',
            message: 'Your 7-day free trial has expired. Please subscribe to continue chatting with bots.',
            trialEnded: true
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Reset daily message counter if it's a new day
      const lastReset = user.lastMessageReset ? new Date(user.lastMessageReset) : null;
      const shouldReset = !lastReset || 
        lastReset.getDate() !== now.getDate() || 
        lastReset.getMonth() !== now.getMonth() || 
        lastReset.getFullYear() !== now.getFullYear();
      
      if (shouldReset) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            messageCount: 0,
            lastMessageReset: now,
          },
        });
        user.messageCount = 0;
        user.lastMessageReset = now;
      }
      
      // Check if daily message limit is reached
      if (user.messageCount >= user.dailyMessageLimit) {
        const trialDaysLeft = user.trialEndsAt ? Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return new NextResponse(
          JSON.stringify({
            error: 'DAILY_LIMIT_REACHED',
            message: `You've reached your daily limit of ${user.dailyMessageLimit} messages. Upgrade to send unlimited messages!`,
            limitReached: true,
            trialDaysLeft
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Increment message count
      await prisma.user.update({
        where: { id: user.id },
        data: {
          messageCount: user.messageCount + 1,
        },
      });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    if (bot.tier > effectiveTier) {
      return new NextResponse('Upgrade required to access this bot', { status: 403 });
    }

    // Check if assistant ID is configured (do this early before creating conversation)
    if (!bot.openaiAssistantId || bot.openaiAssistantId.includes('REPLACE')) {
      console.error('[CHAT_ERROR] Bot missing OpenAI Assistant ID:', { botId: bot.id, botSlug: bot.slug, assistantId: bot.openaiAssistantId });
      return new NextResponse(
        'This bot is not fully configured yet. Please contact an administrator to set up the OpenAI Assistant ID.',
        { status: 503 }
      );
    }

    let conversation;
    let threadId: string | undefined;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
      });

      if (!conversation) {
        return new NextResponse('Conversation not found', { status: 404 });
      }

      // Use existing thread ID or create new one if missing
      if (conversation.threadId) {
        threadId = conversation.threadId;
      } else {
        try {
          threadId = await createThread();
          // Update conversation with new thread ID
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { threadId },
          });
        } catch (error) {
          console.error('[CHAT_ERROR] Failed to create thread:', error);
          return new NextResponse('Failed to create chat thread', { status: 500 });
        }
      }
    } else {
      try {
        threadId = await createThread();
        console.log('[CHAT_DEBUG] Created new thread:', threadId);
        
        conversation = await prisma.conversation.create({
          data: {
            userId: user.id,
            botId: bot.id,
            title: message.substring(0, 50),
            threadId: threadId,
          },
        });
        console.log('[CHAT_DEBUG] Created conversation with threadId:', conversation.threadId);
      } catch (error) {
        console.error('[CHAT_ERROR] Failed to create conversation:', error);
        return new NextResponse('Failed to create conversation', { status: 500 });
      }
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Check if image is provided but bot doesn't have image recognition enabled
    if (imageUrl && !bot.imageRecognition) {
      return new NextResponse(
        'This bot does not have image recognition enabled. Upgrade to use this feature!',
        { status: 403 }
      );
    }

    // Ensure threadId exists
    if (!threadId) {
      console.error('[CHAT_ERROR] ThreadID is undefined after conversation setup');
      console.error('[CHAT_ERROR] Conversation:', conversation);
      return new NextResponse('Failed to create chat thread', { status: 500 });
    }

    console.log('[CHAT_DEBUG] About to send message with threadId:', threadId);
    console.log('[CHAT_DEBUG] Bot assistant ID:', bot.openaiAssistantId);
    console.log('[CHAT_DEBUG] Bot slug:', bot.slug);

    // Add user context for Email Bot
    let userContext = '';
    if (bot.slug === 'email-bot') {
      // Get user's name from Clerk
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const userName = clerkUser.firstName || clerkUser.fullName || user.email.split('@')[0] || 'User';
        userContext = `[USER CONTEXT]: The person writing this email is named "${userName}". When creating email signatures or sign-offs, use this name.\n\n`;
      } catch (error) {
        console.error('[EMAIL_BOT] Failed to fetch user name from Clerk:', error);
        // Fallback to email username
        const fallbackName = user.email.split('@')[0];
        userContext = `[USER CONTEXT]: The person writing this email is named "${fallbackName}". When creating email signatures or sign-offs, use this name.\n\n`;
      }
    }

    // Perform web search if Web Search power-up is active
    let enhancedMessage = userContext + message;
    const hasWebSearch = activePowerUps?.includes('webSearch');
    
    if (hasWebSearch) {
      // Add web search capability context
      if (shouldPerformWebSearch(message)) {
        console.log('[WEB_SEARCH] Performing web search for:', message);
        const searchResults = await performWebSearch(message);
        enhancedMessage = userContext + `[SYSTEM]: You have web search capabilities enabled. Here are current web search results:\n\n${searchResults}\n\n[USER QUESTION]: ${message}\n\n[INSTRUCTION]: Use the web search results above to provide an accurate, up-to-date answer. If the search results are relevant, cite them in your response.`;
        console.log('[WEB_SEARCH] Added search context to message');
      } else {
        // Even if we don't search, let the bot know it has the capability
        enhancedMessage = userContext + `[SYSTEM]: You have web search capabilities. If the user asks for current information, let them know you can search the web.\n\n[USER]: ${message}`;
      }
    }

    // Add bot-specific tool data context
    if (conversation?.id) {
      // @ts-expect-error - Prisma type needs refresh
      const toolData = await prisma.botToolData.findMany({
        where: { conversationId: conversation.id },
        orderBy: { updatedAt: 'desc' },
      });

      if (toolData.length > 0) {
        let toolContext = '\n\n[TOOLS DATA]: You have access to the following tools and their current data:\n\n';
        
        toolData.forEach((tool: any) => {
          toolContext += `${tool.toolType.toUpperCase()}:\n`;
          
          // Format tool data based on type
          if (tool.toolType === 'timers' && Array.isArray(tool.data)) {
            const activeTimers = tool.data.filter((t: any) => t.isRunning);
            if (activeTimers.length > 0) {
              toolContext += `- ${activeTimers.length} active timer(s)\n`;
              activeTimers.forEach((t: any) => {
                toolContext += `  • ${t.label}: ${Math.floor(t.remaining / 60)}:${(t.remaining % 60).toString().padStart(2, '0')} remaining\n`;
              });
            }
          } else if (tool.toolType === 'ingredients' && Array.isArray(tool.data)) {
            toolContext += `- Ingredients: ${tool.data.join(', ')}\n`;
          } else if (tool.toolType === 'recipe' && typeof tool.data === 'string') {
            toolContext += `- Recipe Notes: ${tool.data.substring(0, 200)}${tool.data.length > 200 ? '...' : ''}\n`;
          } else if (tool.toolType === 'venue' && typeof tool.data === 'string') {
            toolContext += `- Fishing Venue: ${tool.data}\n`;
          } else if (tool.toolType === 'weather' && typeof tool.data === 'object') {
            const w = tool.data as any;
            toolContext += `- Weather: ${w.temp}, ${w.condition}, Pressure: ${w.pressure}\n`;
          } else if (tool.toolType === 'catches' && Array.isArray(tool.data)) {
            toolContext += `- Catches logged: ${tool.data.length}\n`;
            if (tool.data.length > 0) {
              const latest = tool.data[tool.data.length - 1];
              toolContext += `  • Latest: ${latest.species} (${latest.weight})\n`;
            }
          } else if (tool.toolType === 'inspections' && Array.isArray(tool.data)) {
            toolContext += `- Inspections: ${tool.data.length} recorded\n`;
            if (tool.data.length > 0) {
              const latest = tool.data[0];
              toolContext += `  • Latest: Strength ${latest.colonyStrength}/5, Queen ${latest.queenSpotted ? 'spotted' : 'not seen'}\n`;
            }
          } else if (tool.toolType === 'cv_profile' && typeof tool.data === 'object') {
            const cv = tool.data as any;
            toolContext += `- CV Profile Data:\n`;
            if (cv.fullName) toolContext += `  • Name: ${cv.fullName}\n`;
            if (cv.contactInfo) toolContext += `  • Contact: ${cv.contactInfo}\n`;
            if (cv.professionalSummary) {
              toolContext += `  • Professional Summary: ${cv.professionalSummary.substring(0, 200)}${cv.professionalSummary.length > 200 ? '...' : ''}\n`;
            }
            if (cv.workExperience && Array.isArray(cv.workExperience) && cv.workExperience.length > 0) {
              toolContext += `  • Work Experience: ${cv.workExperience.length} position(s)\n`;
              cv.workExperience.forEach((exp: any, idx: number) => {
                if (exp.company || exp.role) {
                  toolContext += `    ${idx + 1}. ${exp.role || 'Position'} at ${exp.company || 'Company'}`;
                  if (exp.duration) toolContext += ` (${exp.duration})`;
                  toolContext += '\n';
                }
              });
            }
            if (cv.skillsQualifications) {
              toolContext += `  • Skills & Qualifications: ${cv.skillsQualifications.substring(0, 150)}${cv.skillsQualifications.length > 150 ? '...' : ''}\n`;
            }
            if (cv.jobDescription) {
              toolContext += `  • Target Job Description: ${cv.jobDescription.substring(0, 300)}${cv.jobDescription.length > 300 ? '...' : ''}\n`;
            }
          } else if (tool.toolType === 'vehicle_profile' && typeof tool.data === 'object') {
            const vehicle = tool.data as any;
            toolContext += `- Vehicle Profile:\n`;
            if (vehicle.make || vehicle.model) {
              const yearPart = vehicle.year ? `${vehicle.year} ` : '';
              const trimPart = vehicle.trim ? ` ${vehicle.trim}` : '';
              toolContext += `  • Vehicle: ${yearPart}${vehicle.make || ''} ${vehicle.model || ''}${trimPart}\n`;
            }
            if (vehicle.registration) {
              toolContext += `  • Registration: ${vehicle.registration}\n`;
            }
            if (vehicle.mileageAtLastService) {
              toolContext += `  • Mileage @ Last Service: ${vehicle.mileageAtLastService} miles\n`;
            }
            if (vehicle.motDueDate) {
              toolContext += `  • MOT Due: ${vehicle.motDueDate}\n`;
            }
            if (vehicle.nextServiceDate) {
              toolContext += `  • Next Service: ${vehicle.nextServiceDate}\n`;
            }
            if (vehicle.notes) {
              toolContext += `  • Notes: ${vehicle.notes.substring(0, 200)}${vehicle.notes.length > 200 ? '...' : ''}\n`;
            }
          }
          
          toolContext += '\n';
        });

        toolContext += '[INSTRUCTION]: Reference this tools data when relevant to provide context-aware responses. You can suggest using tools or updating data when appropriate.\n';
        
        // Special instruction for Apply Bot when CV profile data is available
        if (bot.slug === 'apply-bot' && toolData.some((t: any) => t.toolType === 'cv_profile')) {
          toolContext += '\n[APPLY BOT SPECIFIC]: Use the CV profile data above to generate tailored CVs and cover letters. When creating documents:\n';
          toolContext += '- Use the full name and contact information provided\n';
          toolContext += '- Incorporate the professional summary and work experience details\n';
          toolContext += '- Highlight relevant skills and qualifications\n';
          toolContext += '- Tailor the content to match the target job description if provided\n';
          toolContext += '- Ensure ATS-friendly formatting and keyword optimization\n';
        }

        if (bot.slug === 'auto-bot' && toolData.some((t: any) => t.toolType === 'vehicle_profile')) {
          toolContext += '\n[AUTO BOT SPECIFIC]: Use the vehicle profile data above when answering. Always:\n';
          toolContext += '- Reference the exact make / model / year when giving advice\n';
          toolContext += '- Tailor maintenance schedules to the provided MOT and service dates\n';
          toolContext += '- Mention any upcoming deadlines (MOT or service) and suggest preparation steps\n';
          toolContext += '- Provide torque specs, fluid types, and safety precautions appropriate for this vehicle\n';
          toolContext += '- If data is missing, ask follow-up questions before guessing\n';
        }
        
        enhancedMessage = toolContext + enhancedMessage;
      }
    }

    let assistantResponse: string;
    try {
      console.log('[CHAT_DEBUG] Calling sendMessage with:', {
        threadId,
        assistantId: bot.openaiAssistantId,
        hasImage: !!imageUrl,
        hasFile: !!fileId,
        messageLength: enhancedMessage.length,
      });
      
      assistantResponse = await sendMessage(
        threadId,
        bot.openaiAssistantId,
        enhancedMessage,
        imageUrl,
        fileId
      );
      
      console.log('[CHAT_DEBUG] Received assistant response, length:', assistantResponse?.length || 0);
    } catch (error) {
      console.error('[CHAT_ERROR] Failed to send message to OpenAI:', error);
      if (error instanceof Error) {
        console.error('[CHAT_ERROR] OpenAI error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      // Re-throw to be caught by outer catch block
      throw error;
    }

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // Track challenge progress for chat-related actions
    // (Fire and forget - don't wait for response)
    const trackChallenges = async () => {
      try {
        // Track "send_messages" challenge
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_messages' }),
        });

        // Track "chat_unique_bots" challenge
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'chat_unique_bots', metadata: { botId: bot.id } }),
        });

        // Track "use_powerup" challenge if power-ups are active
        if (activePowerUps && activePowerUps.length > 0) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'use_powerup' }),
          });
        }
      } catch (error) {
        console.error('[CHALLENGE_TRACK_ERROR]', error);
      }
    };
    trackChallenges(); // Fire and forget

    return NextResponse.json({
      conversationId: conversation.id,
      message: assistantMessage,
    });
  } catch (error) {
    // Enhanced error logging
    console.error('[CHAT_ERROR] Full error:', error);
    console.error('[CHAT_ERROR] Error type:', typeof error);
    console.error('[CHAT_ERROR] Error instanceof Error:', error instanceof Error);
    
    if (error instanceof Error) {
      console.error('[CHAT_ERROR] Error message:', error.message);
      console.error('[CHAT_ERROR] Error stack:', error.stack);
      
      // Log additional properties if available
      if ('cause' in error) {
        console.error('[CHAT_ERROR] Error cause:', (error as any).cause);
      }
    } else {
      console.error('[CHAT_ERROR] Error object:', JSON.stringify(error, null, 2));
    }
    
    // Provide user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = errorMessage.toLowerCase();
    
    // Check for common OpenAI errors and provide friendly messages
    if (errorString.includes('no assistant found') || errorString.includes('assistant')) {
      return new NextResponse('This bot is temporarily unavailable. Please try another bot or contact support.', { status: 503 });
    }
    if (errorString.includes('no thread found') || errorString.includes('thread')) {
      return new NextResponse('Connection lost. Please refresh the page and start a new conversation.', { status: 500 });
    }
    if (errorString.includes('rate_limit') || errorString.includes('rate limit')) {
      return new NextResponse('We\'re experiencing high traffic. Please try again in a moment.', { status: 429 });
    }
    if (errorString.includes('invalid_request_error') || errorString.includes('unsupported')) {
      return new NextResponse('This bot doesn\'t support that action. Try sending a text message instead.', { status: 400 });
    }
    if (errorString.includes('unauthorized') || errorString.includes('api key')) {
      return new NextResponse('Service configuration error. Please contact support.', { status: 503 });
    }
    
    return new NextResponse('Something went wrong. Please try again or contact support if the issue persists.', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse('Conversation ID required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          userId: user.id,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[GET_MESSAGES_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}