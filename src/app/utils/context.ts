import { getMatchesFromEmbeddings } from './pinecone';
import { getEmbeddings } from './embeddings';
import type { Metadata } from './pinecone';

type MatchResult = {
  id: string;
  score?: number;
  metadata?: Metadata;
};

// The function `getContext` is used to retrieve the context of a given message
export const getContext = async (
  message: string,
  namespace: string = '',
  maxTokens: number = 3000,
  minScore: number = 0.3, // Lower threshold to get more relevant results
  getOnlyText: boolean = true
): Promise<string | MatchResult[]> => {
  // Get the embeddings of the input message
  const embedding = await getEmbeddings(message);

  // Retrieve more matches for better context (increased from 3 to 8)
  const matches = await getMatchesFromEmbeddings(embedding, 8, namespace);

  // Filter out the matches that have a score lower than the minimum score
  // Lower threshold means we get more potentially relevant results
  const qualifyingDocs = matches.filter((m) => m.score && m.score > minScore);

  if (!getOnlyText) {
    // Return the full matches
    return qualifyingDocs;
  }

  // Extract text from metadata (support multiple field names)
  let docs = qualifyingDocs.map((match) => {
    const metadata = match.metadata || {};
    return metadata.chunk || metadata.content || metadata.text || '';
  }).filter((text) => text.length > 0);

  // Join all the chunks of text together, truncate to the maximum number of tokens, and return the result
  return docs.join('\n').substring(0, maxTokens);
};

