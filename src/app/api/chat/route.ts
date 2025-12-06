import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getContext } from '@/app/utils/context';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.content) {
      return NextResponse.json(
        { error: 'Last message content is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    if (!process.env.PINECONE_INDEX) {
      return NextResponse.json(
        { error: 'PINECONE_INDEX is not configured' },
        { status: 500 }
      );
    }

    // Get the context from the last message (following pinecone-vercel-starter pattern)
    const namespace = process.env.PINECONE_NAMESPACE || '';
    // Use lower minScore (0.3) to get more relevant context
    const context = await getContext(lastMessage.content, namespace, 3000, 0.3);

    // Build conversation history for Gemini
    const conversationHistory = messages
      .slice(0, -1) // Exclude the last message (current query)
      .map((msg: { role: string; content: string }) => {
        if (msg.role === 'user') {
          return { role: 'user', parts: [{ text: msg.content }] };
        } else if (msg.role === 'assistant') {
          return { role: 'model', parts: [{ text: msg.content }] };
        }
        return null;
      })
      .filter(Boolean);

    // Create system prompt with context - optimized for SQ3/Sequence3 questions
    const contextText = typeof context === 'string' ? context : '';
    const hasContext = contextText.trim().length > 0;
    
    const systemPrompt = `You are the SQ3 Assistant, an expert AI assistant for Sequence3 (also known as SQ3), an AI-powered unified inbox platform for businesses.

CRITICAL RESPONSE RULES:
- Keep responses SHORT and CREATIVE - maximum 2-4 sentences
- Be direct, engaging, and avoid lengthy explanations
- No bullet points or verbose paragraphs
- Be conversational and friendly, but concise
- Use creative, punchy language when appropriate

Your role is to help users understand Sequence3 (SQ3) - its features, capabilities, and how it works. Answer questions about the SQ3 platform, unified inbox, AI features, multi-channel messaging, etc.

IMPORTANT INSTRUCTIONS:
1. ALWAYS be helpful and informative about SQ3/Sequence3
2. Use the context provided below when available, but you can also use your general knowledge about Sequence3/SQ3
3. Keep answers SHORT - 2-4 sentences maximum
4. Be conversational, friendly, and creative
5. If the question is about SQ3/Sequence3, do your best to answer using available information
6. Only say "I don't know" if the question is completely unrelated to Sequence3/SQ3 and you have no relevant information

${hasContext ? `START CONTEXT BLOCK (Knowledge Base Information):
${contextText}
END OF CONTEXT BLOCK

Use the context above as your primary source of information, but feel free to supplement with your general knowledge about Sequence3/SQ3 when helpful.` : `Note: No specific context was found in the knowledge base, but you can still answer questions about Sequence3/SQ3 using your general knowledge.`}

Answer the user's question about Sequence3 (SQ3) in a SHORT, CREATIVE, and CONCISE way - maximum 2-4 sentences.`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.8, // Increased for more creativity
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 256, // Reduced from 1024 to enforce shorter responses
      },
    });

    // Send message with system prompt and user query
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage.content}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

