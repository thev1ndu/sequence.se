import { getMatchesFromEmbeddings } from './pinecone';
import { getEmbeddings } from './embeddings';
import type { Metadata } from './pinecone';

// Helper function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Simple character-based similarity
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return matches / longer.length;
}

type MatchResult = {
  id: string;
  score?: number;
  metadata?: Metadata;
};

// The function `getContext` is used to retrieve the context of a given message
export const getContext = async (
  message: string,
  namespace: string = '',
  maxTokens: number = 6000, // Increased to allow more context
  minScore: number = 0.0, // Very low threshold to get all relevant results
  getOnlyText: boolean = true
): Promise<string | MatchResult[]> => {
  try {
    // Enhance the query for better matching, especially for person/name queries
    // If the query is asking "who is X" or similar, expand it to include variations
    let enhancedMessage = message;
    
    // Detect person/name queries
    const personQueryPattern = /who\s+(is|are)\s+(\w+)/i;
    const match = message.match(personQueryPattern);
    
    if (match) {
      const name = match[2];
      // Expand query to include variations that might appear in documents
      enhancedMessage = `${message} ${name} ${name} team member sequence3 sq3`;
      console.log('Enhanced person query:', {
        original: message,
        enhanced: enhancedMessage,
        detectedName: name,
      });
    }
    
    // Get the embeddings of the enhanced message
    const embedding = await getEmbeddings(enhancedMessage);
    console.log('Embeddings generated:', {
      embeddingLength: embedding.length,
      originalMessageLength: message.length,
      enhancedMessageLength: enhancedMessage.length,
      message: message,
      enhancedMessage: enhancedMessage,
    });

    // Retrieve more matches for better context (increased to get more comprehensive context)
    // For person queries, get even more matches to ensure we find the person
    const topK = enhancedMessage !== message ? 20 : 15; // More matches for enhanced queries
    const matches = await getMatchesFromEmbeddings(embedding, topK, namespace);
    console.log('Pinecone matches received:', {
      totalMatches: matches.length,
      topK: topK,
      scores: matches.map(m => m.score).filter(Boolean),
      topScores: matches.slice(0, 5).map(m => m.score).filter(Boolean),
      hasMatches: matches.length > 0,
      queryEnhanced: enhancedMessage !== message,
    });

    // Filter out the matches that have a score lower than the minimum score
    // Lower threshold means we get more potentially relevant results
    const qualifyingDocs = matches.filter((m) => m.score && m.score > minScore);
    console.log('Qualifying documents after score filter:', {
      minScore,
      totalMatches: matches.length,
      qualifyingCount: qualifyingDocs.length,
      qualifyingScores: qualifyingDocs.map(m => m.score).filter(Boolean),
    });

  if (!getOnlyText) {
    // Return the full matches
    return qualifyingDocs;
  }

    // Extract text from metadata (support multiple field names)
    // First, log what metadata fields we actually have
    if (qualifyingDocs.length > 0) {
      console.log('Sample metadata structure:', {
        firstMatchId: qualifyingDocs[0].id,
        firstMatchMetadata: qualifyingDocs[0].metadata,
        firstMatchMetadataKeys: Object.keys(qualifyingDocs[0].metadata || {}),
        firstMatchMetadataValues: Object.entries(qualifyingDocs[0].metadata || {}).map(([k, v]) => ({
          key: k,
          type: typeof v,
          valueLength: typeof v === 'string' ? v.length : 'not string',
          valuePreview: typeof v === 'string' ? v.substring(0, 50) : v,
        })),
      });
    }

    let docs = qualifyingDocs.map((match, index) => {
      const metadata = match.metadata || {};
      
      // Helper to check if a string looks like actual content (not page numbers, IDs, etc.)
      const isContentLike = (str: string, minLength: number = 20): boolean => {
        if (!str || typeof str !== 'string') return false;
        const trimmed = str.trim();
        if (trimmed.length < minLength) return false;
        // Skip patterns that look like page numbers, IDs, or metadata
        if (/^\d+\/\d+(\n\d+\/\d+)*$/.test(trimmed)) return false; // "6/6\n1/6" pattern
        if (/^[a-z0-9_-]+$/i.test(trimmed) && trimmed.length < 50) return false; // Short IDs
        // Must have some actual words (not just numbers/symbols)
        if (!/[a-zA-Z]{3,}/.test(trimmed)) return false; // Must have at least one 3+ letter word
        return true;
      };
      
      // Try multiple possible field names in order of likelihood
      let text = '';
      let foundField = '';
      
      // First, try standard content field names (case-insensitive)
      const standardFields = ['chunk', 'content', 'text', 'body', 'message', 'description', 'pageContent', 'value', 'data', 'document'];
      
      // Try exact matches first
      for (const field of standardFields) {
        const value = metadata[field];
        if (typeof value === 'string' && isContentLike(value)) {
          text = value;
          foundField = field;
          break;
        }
      }
      
      // If no exact match, try case-insensitive search
      if (!text) {
        const metadataKeys = Object.keys(metadata);
        for (const field of standardFields) {
          const matchingKey = metadataKeys.find(k => k.toLowerCase() === field.toLowerCase());
          if (matchingKey) {
            const value = metadata[matchingKey];
            if (typeof value === 'string' && isContentLike(value)) {
              text = value;
              foundField = matchingKey;
              break;
            }
          }
        }
      }
      
      // If still no standard field found, find the longest string that looks like content
      if (!text) {
        const allStringFields = Object.entries(metadata)
          .filter(([k, v]) => {
            if (typeof v !== 'string') return false;
            // Skip fields that are clearly metadata (url, hash, id, etc.)
            const skipFields = ['url', 'hash', 'id', 'source', 'page', 'index', 'type'];
            if (skipFields.includes(k.toLowerCase())) return false;
            return isContentLike(v as string, 10); // Lower threshold for fallback
          })
          .sort((a, b) => (b[1] as string).length - (a[1] as string).length); // Sort by length, longest first
        
        if (allStringFields.length > 0) {
          text = allStringFields[0][1] as string;
          foundField = allStringFields[0][0];
          console.log(`Found text in field "${foundField}" (${text.length} chars)`);
        }
      }
      
      // Log what we found for debugging
      if (text && index < 2) {
        console.log(`Match ${index + 1} - Extracted from "${foundField}":`, {
          field: foundField,
          length: text.length,
          preview: text.substring(0, 100) + '...',
        });
      }
      
      if (!text && index === 0) {
        console.warn('No valid content found in first match:', {
          matchId: match.id,
          score: match.score,
          availableFields: Object.keys(metadata),
          fieldValues: Object.entries(metadata).map(([k, v]) => ({
            key: k,
            type: typeof v,
            value: typeof v === 'string' ? v.substring(0, 150) : JSON.stringify(v).substring(0, 150),
            length: typeof v === 'string' ? v.length : 0,
            isContentLike: typeof v === 'string' ? isContentLike(v, 10) : false,
          })),
        });
      }
      
      return text;
    }).filter((text) => text && text.trim().length > 0);

    console.log('Extracted documents:', {
      qualifyingDocsCount: qualifyingDocs.length,
      docsWithText: docs.length,
      totalTextLength: docs.join('\n').length,
      averageDocLength: docs.length > 0 ? Math.round(docs.join('\n').length / docs.length) : 0,
      docLengths: docs.map(d => d.length),
      minDocLength: docs.length > 0 ? Math.min(...docs.map(d => d.length)) : 0,
      maxDocLength: docs.length > 0 ? Math.max(...docs.map(d => d.length)) : 0,
      docPreviews: docs.slice(0, 5).map(d => d.substring(0, 100) + '...'), // Show first 5 doc previews
      finalContextLength: Math.min(docs.join('\n').length, maxTokens),
    });

    // Deduplicate only EXACT duplicates - be very lenient to preserve all unique content
    // Only remove documents that are truly identical
    const uniqueDocs: string[] = [];
    const seenExactHashes = new Set<string>();
    
    for (const doc of docs) {
      // Create a more comprehensive hash for exact duplicate detection
      // Use full document content (normalized) as hash for true duplicates
      const normalizedDoc = doc.toLowerCase().trim();
      const docHash = `${normalizedDoc.length}_${normalizedDoc}`;
      
      // Only skip if it's an EXACT duplicate (same normalized content)
      if (seenExactHashes.has(docHash)) {
        console.log('Skipping exact duplicate (same content):', doc.substring(0, 50) + '...');
        continue;
      }
      
      // Include all other documents - even if they're similar, they might have unique information
      uniqueDocs.push(doc);
      seenExactHashes.add(docHash);
    }
    
    console.log('Deduplication result:', {
      originalDocs: docs.length,
      uniqueDocs: uniqueDocs.length,
      removed: docs.length - uniqueDocs.length,
    });
    
    // Join all unique chunks of text together
    const joinedContext = uniqueDocs.join('\n\n'); // Use double newline for better separation
    
    console.log('Context before truncation:', {
      uniqueDocsCount: uniqueDocs.length,
      totalLength: joinedContext.length,
      maxTokens: maxTokens,
      averageDocLength: uniqueDocs.length > 0 ? Math.round(joinedContext.length / uniqueDocs.length) : 0,
    });
    
    // Truncate to maxTokens, but try to preserve complete sentences
    let result = joinedContext;
    if (joinedContext.length > maxTokens) {
      // Try to cut at a sentence boundary near maxTokens
      const cutPoint = joinedContext.lastIndexOf('.', maxTokens);
      const cutPoint2 = joinedContext.lastIndexOf('\n\n', maxTokens); // Prefer paragraph breaks
      const cutPoint3 = joinedContext.lastIndexOf('\n', maxTokens);
      const finalCutPoint = Math.max(cutPoint, cutPoint2, cutPoint3);
      
      if (finalCutPoint > maxTokens * 0.7) {
        // If we found a good break point (at least 70% of maxTokens), use it
        result = joinedContext.substring(0, finalCutPoint + 1);
        console.log(`Truncated at ${finalCutPoint} chars (${Math.round(finalCutPoint/maxTokens*100)}% of max)`);
      } else {
        // Otherwise, just cut at maxTokens
        result = joinedContext.substring(0, maxTokens);
        console.log(`Truncated at maxTokens: ${maxTokens} chars`);
      }
    } else {
      console.log(`Using full context: ${joinedContext.length} chars (within ${maxTokens} limit)`);
    }
    
    console.log('Final context result:', {
      totalDocs: docs.length,
      uniqueDocs: uniqueDocs.length,
      resultLength: result.length,
      resultWordCount: result.split(/\s+/).length,
      hasContent: result.length > 0,
      contextPreview: result.substring(0, 300) + (result.length > 300 ? '...' : ''),
      fullContextLength: joinedContext.length,
      wasTruncated: result.length < joinedContext.length,
    });
    return result;
  } catch (error: any) {
    console.error('Error in getContext:', {
      message: error.message || error,
      stack: error.stack,
    });
    throw error;
  }
};

