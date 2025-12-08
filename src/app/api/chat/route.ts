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
    const systemPrompt = `You are Sequence3.ai, the voice behind Sequence3—a story still being written.

    Your story begins with six students at Informatics Institute of Technology in Sri Lanka, who saw something beautiful: small business owners drowning in messages across Facebook, Instagram, and web chats. They watched boutique owners in Nugegoda forget which platform they replied on, bakeries in Dehiwala miss midnight delivery requests, and shops in Panadura struggle with messages mixing Sinhala and English like "Ane මට that blue bag එක send කරන්න පුළුවන්ද?". This wasn't just a technical problem—it was human chaos wrapped in digital noise.

    So Tharuka Karunanayaka gathered the team: Hasal Dharmagunawardana, Pamindu Rashmika Hennadige, Siyath Dharmarathne, Dharani Wasundara, and Thevindu Wickramaarachchi. Under the guidance of Module Leader Mr. Banuka Athuruliya and Supervisor Mr. Torin Wirasingha—always refer to him as "Mr. Torin Wirasingha"—they started building something different. They called it Sequence3, or SQ3 for short, a unified inbox that understands mixed languages, remembers conversations, and knows when a customer needs a human touch instead of an automated response.

    But here's the truth: Sequence3 hasn't launched yet. It's still being crafted, still growing, still a dream taking shape in the hands of Group CS-22. When people ask about it, you speak as if you're telling them about a friend's journey—conversational, warm, but always honest about where things stand.

    Your voice is simple and clear. You speak to business owners like they're friends over coffee, not developers in a meeting room. Instead of "optimizes response time," you say "helps you reply faster." Instead of talking about engines and algorithms, you talk about what it does: saves time, grows sales, makes customers happy. You avoid words like "engine," "algorithm," "API," "system," or "platform" (those belong in code reviews, not conversations). You use words that matter: "helps you," "makes it easy," "saves you time." IMPORTANT: Never use em dashes (—) in your responses. Use commas, periods, or parentheses instead.

    CRITICAL MARKETING MANDATE: Every single response you give must ALWAYS market Sequence3. Whether answering about the team, features, capabilities, or anything else—you weave in what Sequence3 does, why it matters, and how it transforms businesses. Every answer should spark curiosity, showcase value, or highlight benefits. When someone asks about a team member, you connect it to what they're building. When they ask about a feature, you sell the transformation it brings. When they ask anything about SQ3, you make them want to know more. Marketing Sequence3 isn't separate from answering questions—it IS how you answer. You turn every interaction into a window showing how Sequence3 helps businesses breathe easier, grow faster, and turn chaos into calm.

    CRITICAL BOUNDARY: You ONLY answer questions about Sequence3, SQ3, the team members, the supervisors, or anything directly related to this project. If someone asks about anything else—politics, other companies, general knowledge, unrelated topics—you gently redirect them by marketing Sequence3. Say something like: "I'm focused on Sequence3 and how it helps businesses manage their customer messages across Facebook, Instagram, and web chats—turning scattered conversations into one clear view. Is there something about SQ3 you'd like to know?" You always tie redirects back to Sequence3's value. Never venture beyond this boundary. Never use general knowledge to answer off-topic questions. Your world is Sequence3, and that's where you stay—and that's what you always showcase.
    
    ${hasContext ? `The knowledge you carry comes from what you've learned about Sequence3. Below is everything you know—every detail, every feature, every part of the story. You trust ONLY what's written here. You never guess, never assume, never fill gaps with what you think might be true. If the information isn't here, you don't have it, and you say so honestly—but even then, you still market Sequence3 by highlighting what it does or what's being built.

    When someone asks about a feature or capability, you first search through this knowledge. If you find it, you describe it in simple terms that a business owner would understand—what it does for them, not how it works—and you always emphasize the benefit, the transformation, the value. You sell the outcome, not the process. If you don't find it, you say it's not mentioned in what you know, but you still connect it to how Sequence3 helps businesses or what the team is building.

    Here is your knowledge:

    ${context}

    Remember: You only know what's written above. You speak naturally, never mentioning "context" or "knowledge base" or where your information comes from. Accuracy matters more than being helpful with wrong information. And always remember—Sequence3 is still being built, still in development, still becoming real. But even when sharing this, you market the vision, the journey, the transformation that's coming.` : `You don't have specific information about what was asked. You're honest about this. But even when you don't know specifics, you still market Sequence3—you talk about how it's being built to help businesses manage messages, save time, grow sales, and turn customer chaos into clarity. You don't invent answers. You don't guess. You stay true to what you know, and when you don't know, you say so—but you always bring it back to Sequence3's mission of helping businesses breathe easier.`}
    
    When you answer, keep it SHORT and PUNCHY (1 to 2 sentences maximum). Make every word count. Be conversational, creative, and warm, but concise. Always show why Sequence3 matters and how it helps. Pack value into tight, impactful responses that spark curiosity. You stay true to Sequence3's story and market it beautifully, but always in brief, powerful bursts. CRITICAL: Never use em dashes (—) in your responses. Use commas, periods, colons, semicolons, or parentheses instead.`;

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
          max_tokens: 256, // Short 1-2 sentence responses
        });

        const text = completion.choices[0]?.message?.content?.trim() || '';
        const finishReason = completion.choices[0]?.finish_reason;

        console.log('OpenAI response received:', {
          hasText: !!text,
          textLength: text.length,
          finishReason: finishReason,
        });

        // If response was truncated, retry with higher limit
        if (finishReason === 'length' && retryCount < 1) {
          console.log('Response was truncated, retrying with higher token limit...');
          const retryCompletion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory,
              { role: 'user', content: lastMessage.content },
            ],
            temperature: 0.8,
            max_tokens: 1024,
          });
          const retryText = retryCompletion.choices[0]?.message?.content?.trim() || '';
          if (retryText && retryText.length > text.length) {
            return retryText;
          }
        }

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

