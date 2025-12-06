import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getEmbeddings(input: string): Promise<number[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable not set');
    }

    // Use Gemini embedding model: text-embedding-004
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResponse = await embeddingModel.embedContent(
      input.replace(/\n/g, ' ')
    );

    // Extract embedding values
    const embeddingData = embeddingResponse.embedding;
    let embedding: number[] = [];

    if (Array.isArray(embeddingData)) {
      embedding = embeddingData;
    } else if (embeddingData && typeof embeddingData === 'object') {
      // Try different possible property names
      embedding = (embeddingData as any).values ||
        (embeddingData as any).embedding ||
        Object.values(embeddingData).filter((v): v is number => typeof v === 'number') as number[];
    }

    if (embedding.length === 0) {
      throw new Error('Failed to extract embedding from Gemini response');
    }

    // Gemini text-embedding-004 returns 768 dimensions
    // Validate dimension count
    if (embedding.length !== 768) {
      console.warn(`Expected 768 dimensions, got ${embedding.length}. Using as-is.`);
    }

    // Return 768-dimensional embedding as-is (no padding/truncation)
    return embedding;
  } catch (e) {
    console.error('Error calling Gemini embedding API: ', e);
    throw new Error(`Error calling Gemini embedding API: ${e}`);
  }
}

