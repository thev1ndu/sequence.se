import { Pinecone } from '@pinecone-database/pinecone';

export type Metadata = {
  url?: string;
  text?: string;
  chunk?: string;
  content?: string;
  hash?: string;
  [key: string]: any;
};

// Initialize Pinecone client (singleton pattern)
let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable not set');
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

// The function `getMatchesFromEmbeddings` is used to retrieve matches for the given embeddings
const getMatchesFromEmbeddings = async (
  embeddings: number[],
  topK: number,
  namespace: string
): Promise<Array<{
  id: string;
  score?: number;
  metadata?: Metadata;
}>> => {
  let indexName: string = process.env.PINECONE_INDEX || '';
  if (indexName === '') {
    throw new Error('PINECONE_INDEX environment variable not set');
  }

  // Clean index name - remove any URL prefixes or trailing slashes
  indexName = indexName.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // If it looks like a hostname, extract just the index name (part before first dot)
  if (indexName.includes('.svc.')) {
    indexName = indexName.split('.')[0];
  }

  // Validate embeddings
  if (!embeddings || embeddings.length === 0) {
    throw new Error('Embeddings array is empty');
  }

  // Validate dimension count (should be 768 for Gemini text-embedding-004)
  if (embeddings.length !== 768) {
    console.warn(`Expected 768 dimensions, got ${embeddings.length}. Proceeding anyway.`);
  }

  // Get Pinecone client
  const pc = getPineconeClient();

  // Get the Pinecone index directly (SDK v6 handles host resolution automatically)
  const index = pc.index(indexName);

  // Get the namespace (default to empty string if not provided)
  const pineconeNamespace = index.namespace(namespace || '');

  try {
    // Query the index with the defined request
    const queryResult = await pineconeNamespace.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
    });
    
    // Return matches in the expected format
    return (queryResult.matches || []).map((match) => ({
      id: match.id || '',
      score: match.score,
      metadata: (match.metadata || {}) as Metadata,
    }));
  } catch (e: any) {
    // Log detailed error information
    console.error('Error querying embeddings:', {
      error: e.message || e,
      indexName,
      namespace: namespace || '(default)',
      embeddingLength: embeddings.length,
      topK,
      errorType: e.constructor?.name,
    });
    throw new Error(`Error querying embeddings: ${e.message || e}`);
  }
};

export { getMatchesFromEmbeddings };

