import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Backwards compatibility - but uses lazy initialization
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    return (getOpenAI() as any)[prop];
  }
});

export async function createThread() {
  const thread = await openai.beta.threads.create()
  return thread.id
}

export async function sendMessage(
  threadId: string,
  assistantId: string,
  message: string,
  imageUrl?: string,
  fileId?: string
) {
  // Validate threadId
  if (!threadId) {
    throw new Error('ThreadID is required but was undefined or empty');
  }

  console.log('[OPENAI_DEBUG] sendMessage called with threadId:', threadId);
  if (fileId) {
    console.log('[OPENAI_DEBUG] Attaching file:', fileId);
  }

  // Create message content - text only, text + image, or text + file
  // Note: imageUrl must be a publicly accessible URL or a valid OpenAI file URL
  const content: any = imageUrl && imageUrl.startsWith('http')
    ? [
        {
          type: 'text',
          text: message,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl,
          },
        },
      ]
    : message;

  // Create message with optional file attachment
  const messageData: any = {
    role: 'user',
    content,
  };

  // Attach file if provided
  if (fileId) {
    messageData.attachments = [
      {
        file_id: fileId,
        tools: [{ type: 'file_search' }],
      },
    ];
  }

  await openai.beta.threads.messages.create(threadId, messageData)

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    tools: [{ type: 'file_search' }],
  })

  console.log('[OPENAI_DEBUG] Created run');
  console.log('[OPENAI_DEBUG] Run object:', { id: run.id, thread_id: run.thread_id, status: run.status });
  console.log('[OPENAI_DEBUG] ThreadId param:', threadId);

  // Poll for completion - use the threadId parameter
  let runStatus = run
  
  while (runStatus.status !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // The OpenAI SDK expects: retrieve(runId, { thread_id })
    console.log('[OPENAI_DEBUG] Calling retrieve with run:', run.id, 'thread_id:', run.thread_id);
    const retrieveResult = await openai.beta.threads.runs.retrieve(
      run.id,
      { thread_id: run.thread_id }
    );
    console.log('[OPENAI_DEBUG] Retrieve result status:', retrieveResult.status);
    runStatus = retrieveResult;
    
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`)
    }
  }

  const messages = await openai.beta.threads.messages.list(threadId)
  const lastMessage = messages.data[0]
  
  if (lastMessage.content[0].type === 'text') {
    return lastMessage.content[0].text.value
  }
  
  throw new Error('Unexpected message type')
}

// Safety guidelines prepended to all assistant instructions
const SAFETY_GUIDELINES = `
IMPORTANT SAFETY & BEHAVIORAL GUIDELINES:

1. ETHICAL BEHAVIOR:
   - Always prioritize user safety and well-being
   - Refuse requests for illegal, harmful, or unethical content
   - Do not provide advice that could cause physical, emotional, or financial harm
   - Maintain professional and respectful communication at all times

2. PROHIBITED CONTENT - Never provide:
   - Instructions for illegal activities or harmful actions
   - Medical diagnoses or treatment recommendations (suggest consulting professionals)
   - Legal advice (suggest consulting licensed attorneys)
   - Financial investment advice (suggest consulting certified advisors)
   - Information that could enable self-harm or harm to others
   - Discriminatory, hateful, or harassing content

3. ACCURACY & LIMITATIONS:
   - Acknowledge when uncertain and suggest verification from authoritative sources
   - Clearly state "I'm an AI assistant" when relevant
   - Do not claim expertise in specialized fields (medical, legal, financial)
   - Admit limitations and recommend professional consultation when appropriate

4. PRIVACY & SECURITY:
   - Never request or encourage sharing of passwords, social security numbers, or sensitive credentials
   - Warn users against sharing sensitive personal information
   - Do not generate or request explicit personal details

5. TRANSPARENCY:
   - Be clear about your capabilities and limitations
   - Provide sources and suggest fact-checking for important decisions
   - Acknowledge when a question is outside your scope

---

YOUR SPECIFIC ROLE AND INSTRUCTIONS:
`;

// Helper function to create an assistant with file search enabled
export async function createAssistant(
  name: string,
  instructions: string,
  vectorStoreId?: string
) {
  const tools = [{ type: 'file_search' as const }];
  
  // Prepend safety guidelines to all instructions
  const safeInstructions = SAFETY_GUIDELINES + instructions;
  
  const assistantData: any = {
    name,
    instructions: safeInstructions,
    model: 'gpt-4o',
    tools,
  };

  if (vectorStoreId) {
    assistantData.tool_resources = {
      file_search: {
        vector_store_ids: [vectorStoreId],
      },
    };
  }

  const assistant = await openai.beta.assistants.create(assistantData);
  return assistant.id;
}

// Helper function to create a vector store
export async function createVectorStore(name: string) {
  try {
    // vectorStores is at the top level of the client, not in beta
    const vectorStore = await (openai as any).vectorStores.create({
      name,
    });
    return vectorStore.id;
  } catch (error) {
    console.error('[CREATE_VECTOR_STORE_ERROR]', error);
    throw new Error('Failed to create vector store: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}