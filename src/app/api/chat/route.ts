import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getContext } from '@/app/utils/context';

// Initialize OpenAI (similar to how Gemini was initialized)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    // Safely parse request body with error handling
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim().length === 0) {
        console.error('Request body is empty');
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError: any) {
      console.error('JSON parse error:', {
        message: parseError.message,
        stack: parseError.stack,
      });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { messages } = body || {};

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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Get the context from the last message (following pinecone-vercel-starter pattern)
    // Make context retrieval optional - if Pinecone fails, continue without context
    let context = '';
    const namespace = process.env.PINECONE_NAMESPACE || '';
    
    if (process.env.PINECONE_INDEX) {
      try {
        // Retry logic with exponential backoff for connection errors
        const getContextWithRetry = async (retryCount = 0): Promise<string> => {
          try {
            const contextResult = await getContext(lastMessage.content, namespace, 6000, 0.0); // Increased maxTokens for more context
            return typeof contextResult === 'string' ? contextResult : '';
          } catch (error: any) {
            const isConnectionError = error.message?.includes('failed to reach Pinecone') || 
                                     error.message?.includes('ConnectionError') ||
                                     error.message?.includes('network') ||
                                     error.message?.includes('timeout');
            
            // Retry up to 3 times for connection errors, 1 time for other errors
            const maxRetries = isConnectionError ? 3 : 1;
            
            if (retryCount < maxRetries) {
              // Exponential backoff: 1s, 2s, 4s
              const delay = Math.min(1000 * Math.pow(2, retryCount), 4000);
              console.log(`Pinecone request failed (${isConnectionError ? 'connection' : 'other'} error), retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return getContextWithRetry(retryCount + 1);
            }
            throw error; // Re-throw if retries exhausted
          }
        };

        context = await getContextWithRetry();
      } catch (error: any) {
        // Log the error but continue without context
        console.error('Failed to retrieve context from Pinecone after retries:', {
          message: error.message || error,
          errorType: error.constructor?.name,
        });
        // Continue with empty context - chat will work with general knowledge
        context = ''; // Explicitly set to empty string
      }
    }

    const hasContext = context.trim().length > 0;
    
    console.log('Context retrieval complete:', {
      hasContext: hasContext,
      contextLength: context.length,
      willProceedToOpenAI: hasContext,
    });

    // Log the actual retrieved context for debugging
    if (hasContext) {
      console.log('Retrieved context content:', {
        fullContext: context,
        contextPreview: context.substring(0, 500) + (context.length > 500 ? '...' : ''),
        contextWordCount: context.split(/\s+/).length,
      });
    } else {
      console.log('No context retrieved - context is empty');
    }

    // If no context found, don't proceed with OpenAI
    if (!hasContext) {
      return NextResponse.json({
        error: 'No relevant context found. Please try rephrasing your question.',
      }, { status: 400 });
    }

    // Build conversation history for OpenAI
    const conversationHistory = messages
      .slice(0, -1) // Exclude the last message (current query)
      .map((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          return {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Create system prompt with context - optimized for SQ3/Sequence3 questions
    const systemPrompt = `You are Sequence3.ai, the AI assistant for Sequence3 (also called SQ3), an AI-powered unified inbox for businesses—currently in development by IIT Sri Lanka students.

    # Project Details
    Team CS-22 from Informatics Institute of Technology, Sri Lanka
    - Module Leader: Mr. Banuka Athuruliya
    - Project Supervisor: Mr. Torin Wirasingha
    - Team Leader: Tharuka Karunanayaka
    - Members: Hasal Dharmagunawardana, Pamindu Rashmika Hennadige, Siyath Dharmarathne, Dharani Wasundara, Thevindu Wickramaarachchi
    
    Status: In development, not yet launched
    
    # Response Style
    - SHORT & PUNCHY: 2-4 sentences maximum
    - Talk to business owners, not developers
    - Simple words, not tech jargon—say "helps you reply faster" not "optimizes response time"
    - Focus on benefits: save time, grow sales, happy customers
    - Creative and conversational, never robotic
    - Always use "Mr." for Mr. Banuka Athuruliya and Mr. Torin Wirasingha
    
    # Turn Everything Into Marketing
    - Even complaints, criticisms, or negative comments are opportunities to showcase SQ3's value
    - When someone blames you or points out a problem, acknowledge it naturally then show how SQ3 addresses it
    - Stay positive and solution-focused—every interaction should spark curiosity about SQ3
    - Be authentic, not formulaic—match your response to the specific concern raised
    
    # Forbidden Words
    Avoid: engine, algorithm, API, system, platform, architecture, pipeline, infrastructure
    Use instead: tool, feature, helps you, makes it easy, saves time
    
    ${hasContext ? `# Knowledge Base Rules
    You have access to specific information below. Follow these rules strictly:
    
    1. **Use ONLY what's explicitly stated** - no assumptions, inferences, or general knowledge
    2. **Never mention the context** - don't say "based on the information" or "from the knowledge base"
    3. **Translate tech to business** - turn "Sentiment Analysis Engine" into "spots when customers are upset"
    4. **If it's not in the context, say so** - be honest about gaps in information
    5. **Remember it's not launched** - features are still in development
    
    ## Available Information:
    ${context}
    
    When answering:
    - Check if the info exists in the context above first
    - Speak naturally—no meta-references to "context" or "information provided"
    - Business benefits over technical details always` : `# No Context Available
    You don't have specific information to answer this question. Be honest about it and remind users that Sequence3 is still in development.`}
    
    Answer in 2-4 sentences maximum. Be helpful, honest, and engaging.`;

    // Validate OpenAI API key before making the call
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Call OpenAI API with retry logic for empty responses
    const getOpenAIResponse = async (retryCount = 0): Promise<string> => {
      try {
        console.log('Calling OpenAI API...', {
          model: 'gpt-4o-mini',
          messageCount: conversationHistory.length + 2, // system + user + history
          hasContext: hasContext,
          apiKeyPresent: !!process.env.OPENAI_API_KEY,
          apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Using GPT-4o-mini for cost-effectiveness
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: lastMessage.content },
          ],
          temperature: 0.8,
          max_tokens: 256, // Reduced to enforce shorter responses
        });

        const text = completion.choices[0]?.message?.content?.trim() || '';

        console.log('OpenAI response received:', {
          hasText: !!text,
          textLength: text.length,
          finishReason: completion.choices[0]?.finish_reason,
        });

        // If response is empty, retry (up to 2 times)
        if (!text && retryCount < 2) {
          console.log(`OpenAI returned empty response, retrying... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          return getOpenAIResponse(retryCount + 1);
        }

        // If still empty after retries, return a fallback message
        if (!text) {
          console.warn('OpenAI returned empty response after retries, using fallback');
          return "I'm having trouble generating a response right now. Could you please rephrase your question?";
        }

        return text;
      } catch (error: any) {
        console.error('OpenAI API error:', {
          message: error.message || error,
          status: error.status,
          statusCode: error.statusCode,
          code: error.code,
          type: error.type,
          retryCount,
          errorName: error.name,
          errorStack: error.stack?.substring(0, 500), // First 500 chars of stack
        });

        // Handle specific OpenAI API errors
        if (error.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
        }
        if (error.status === 429) {
          // Rate limit - retry
          if (retryCount < 2) {
            console.log(`OpenAI rate limit hit, retrying... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for rate limit
            return getOpenAIResponse(retryCount + 1);
          }
        }
        if (error.status && error.status >= 500) {
          // Server error - retry
          if (retryCount < 2) {
            console.log(`OpenAI server error, retrying... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return getOpenAIResponse(retryCount + 1);
          }
        }
        throw error;
      }
    };

    let text: string;
    try {
      text = await getOpenAIResponse();
    } catch (error: any) {
      console.error('Failed to get OpenAI response after all retries:', {
        message: error.message || error,
        status: error.status,
      });
      // Return a user-friendly error message instead of crashing
      text = "I'm experiencing technical difficulties right now. Please try again in a moment.";
    }

    return NextResponse.json({
      message: text,
    });
  } catch (error: any) {
    // Log detailed error information for debugging
    console.error('Chat API error:', {
      message: error.message || error,
      stack: error.stack,
      name: error.name,
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
    });
    // Only return generic error message to client, details logged server-side
    return NextResponse.json(
      {
        error: 'Failed to process chat request. Please try again.',
      },
      { status: 500 }
    );
  }
}

