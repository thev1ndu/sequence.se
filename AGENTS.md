# null

# Pinecone quick reference for agents

> **Official docs**: [https://docs.pinecone.io/](https://docs.pinecone.io/) - For complete API reference, advanced features, and detailed guides.

This guide covers critical gotchas, best practices, and common patterns specific to this project. For anything not covered here, consult the official Pinecone documentation.

***

## ⚠️ Critical: Installation & SDK

**ALWAYS use the current SDK:**

```bash  theme={null}
npm install @pinecone-database/pinecone   # ✅ Correct (current SDK)
npm install pinecone-client               # ❌ WRONG (deprecated, old API)
```

**Current API (2025):**

```typescript  theme={null}
import { Pinecone } from '@pinecone-database/pinecone';  // ✅ Correct import
```

**Requirements:**

* Node.js 18.x or later
* TypeScript 4.1 or later (recommended)

***

## 🛡️ TypeScript Types & Type Safety

When working with the Pinecone SDK, proper type handling prevents runtime errors:

### Search Result Field Typing

Search results return `hit.fields` as a generic object. Always cast to a typed structure:

```typescript  theme={null}
// ❌ WRONG - TypeScript error: Property 'content' does not exist on type 'object'
for (const hit of results.result.hits) {
    console.log(hit.fields.content);  // Compile error!
}

// ✅ CORRECT - Use type casting with Record<string, any>
for (const hit of results.result.hits) {
    const fields = hit.fields as Record<string, any>;
    const content = String(fields?.content ?? '');
    const category = String(fields?.category ?? 'unknown');
}

// ✅ BETTER - Define an interface for your records
interface Document {
    content: string;
    category: string;
}

for (const hit of results.result.hits) {
    const doc = hit.fields as unknown as Document;
    console.log(doc.content, doc.category);
}
```

### Complete Search Hit Interface

```typescript  theme={null}
interface SearchHit {
    _id: string;                          // Record ID
    _score: number;                       // Relevance score (0-1 range)
    fields: Record<string, any>;          // Your custom fields
    metadata?: Record<string, any>;       // Optional metadata
}

interface SearchResults {
    result: {
        hits: SearchHit[];
        matches?: number;
    };
}
```

### Best Practices for Type Safety

1. **Always cast `hit.fields`**: Use `as Record<string, any>` or define a proper interface
2. **Use optional chaining**: `fields?.fieldName ?? defaultValue`
3. **Convert to strings**: `String(value)` when building output
4. **Define record interfaces**: Match your actual record structure for IDE autocomplete

***

## 🔧 CLI vs SDK: When to Use Which

**Use the Pinecone CLI for:**

* ✅ **Creating indexes** - `pc index create`
* ✅ **Deleting indexes** - `pc index delete`
* ✅ **Configuring indexes** - `pc index configure` (replicas, deletion protection)
* ✅ **Listing indexes** - `pc index list`
* ✅ **Describing indexes** - `pc index describe`
* ✅ **Creating API keys** - `pc api-key create`
* ✅ **One-off inspection** - Checking stats, configuration
* ✅ **Development setup** - All initial infrastructure setup

**Use the TypeScript SDK for:**

* ✅ **Data operations in application code** - upsert, query, search, delete RECORDS
* ✅ **Runtime checks** - checking index existence, `index.describeIndexStats()`
* ✅ **Automated workflows** - Any data operations that run repeatedly
* ✅ **Production data access** - Reading and writing vectors/records

**❌ NEVER use SDK for:**

* Creating, deleting, or configuring indexes in application code
* One-time administrative tasks

### Installing the Pinecone CLI

**macOS (Homebrew):**

```bash  theme={null}
brew tap pinecone-io/tap
brew install pinecone-io/tap/pinecone

# Upgrade later
brew update && brew upgrade pinecone
```

**Other platforms:**
Download from [GitHub Releases](https://github.com/pinecone-io/cli/releases) (Linux, Windows, macOS)

### CLI Authentication

Choose one method:

**Option 1: User login (recommended for development)**

```bash  theme={null}
pc login
pc target -o "my-org" -p "my-project"
```

**Option 2: API key**

```bash  theme={null}
export PINECONE_API_KEY="your-api-key"
# Or: pc auth configure --global-api-key <api-key>
```

**Option 3: Service account**

```bash  theme={null}
export PINECONE_CLIENT_ID="your-client-id"
export PINECONE_CLIENT_SECRET="your-client-secret"
```

**Full CLI reference:** [https://docs.pinecone.io/reference/cli/command-reference](https://docs.pinecone.io/reference/cli/command-reference)

### 🔒 API Key Security Best Practices

**❌ NEVER do this:**

```bash  theme={null}
# WRONG - API key in npm script (gets committed to git!)
npm script: "PINECONE_API_KEY=pcsk_abc123... ts-node app.ts"

# WRONG - Hardcoded in source code
const pc = new Pinecone({ apiKey: "pcsk_abc123..." });

# WRONG - Committed .env file with secrets
# git add .env  (DON'T DO THIS!)
```

**✅ DO THIS INSTEAD:**

```bash  theme={null}
# Step 1: Create .env.local (add to .gitignore!)
echo "PINECONE_API_KEY=pcsk_abc123..." > .env.local

# Step 2: Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore

# Step 3: Load environment variables
source .env.local

# Step 4: Use in code
const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY 
});

# Step 5: Run application
npm run start
```

**Why this matters:**

* 🔓 **Git history is forever** - If your key ends up in a commit, it's compromised forever
* 🤖 **Bots scan public repos** - GitHub has automated tools that detect leaked API keys immediately
* 💰 **Financial impact** - Attackers can use your key to run expensive queries
* 🛡️ **Revoke immediately** - If a key is exposed, rotate it in the Pinecone console immediately

***

## Quickstarts

> **Important for all quickstarts**: Execute all steps completely. Keep setup minimal (directories, npm dependencies only). Do not expect the user to satisfy any prerequisites except providing API keys. For summaries, use only README.md and SUMMARY.md.

When you are asked to help get started with Pinecone, ask the user to choose an option:

* Quick test: Create an index, upsert data, and perform semantic search.

* Choose a use case:
  * Search: Build a semantic search system that returns ranked results from your knowledge base. This pattern is ideal for search interfaces where users need a list of relevant documents with confidence scores.

  * RAG: Build a multi-tenant RAG (Retrieval-Augmented Generation) system that retrieves relevant context per tenant and feeds it to an LLM to generate answers. Each tenant (organization, workspace, or user) has isolated data stored in separate Pinecone namespaces. This pattern is ideal for knowledge bases, customer support platforms, and collaborative workspaces.

  * Recommendations: Build a recommendation engine that suggests similar items based on semantic similarity. This pattern is ideal for e-commerce, content platforms, and user personalization systems.

Based on the choice, use the appropriate pattern.

### Setup Prerequisites (all quickstarts)

Before starting any quickstart, complete these steps:

1. **Set up Node.js environment**: Create project directory, initialize npm, and install Pinecone SDK
2. **Install CLI**: Run `pc version` to check. If not installed: `brew tap pinecone-io/tap && brew install pinecone-io/tap/pinecone` (macOS) or download from [GitHub releases](https://github.com/pinecone-io/cli/releases). If already installed, upgrade: `brew update && brew upgrade pinecone`
3. **Configure API key**: Ask user for Pinecone API key, set as `PINECONE_API_KEY` env variable, then run `pc auth configure --api-key $PINECONE_API_KEY`
4. **For RAG quickstart only**: Also obtain and set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### Quick test

Complete [Setup Prerequisites](#setup-prerequisites-all-quickstarts) first.

**Step 1. Implement semantic search**

1. Create an index called "agentic-quickstart-test" with an integrated embedding model that can handle text documents. Use the Pinecone CLI for this. Use the API key env variable to authenticate.

   ```bash  theme={null}
   pc index create -n agentic-quickstart-test -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content
   ```

2. Prepare a sample dataset of factual statements from different domains like history, physics, technology, and music and upsert the dataset into a new namespace in the index:

   ```typescript  theme={null}
   import { Pinecone } from '@pinecone-database/pinecone';

   // Initialize Pinecone client
   const apiKey = process.env.PINECONE_API_KEY;
   if (!apiKey) {
       throw new Error("PINECONE_API_KEY environment variable not set");
   }

   const pc = new Pinecone({ apiKey });

   const records = [
       { _id: "rec1", content: "The Eiffel Tower was completed in 1889 and stands in Paris, France.", category: "history" },
       { _id: "rec2", content: "Photosynthesis allows plants to convert sunlight into energy.", category: "science" },
       { _id: "rec5", content: "Shakespeare wrote many famous plays, including Hamlet and Macbeth.", category: "literature" },
       { _id: "rec7", content: "The Great Wall of China was built to protect against invasions.", category: "history" },
       { _id: "rec15", content: "Leonardo da Vinci painted the Mona Lisa.", category: "art" },
       { _id: "rec17", content: "The Pyramids of Giza are among the Seven Wonders of the Ancient World.", category: "history" },
       { _id: "rec21", content: "The Statue of Liberty was a gift from France to the United States.", category: "history" },
       { _id: "rec26", content: "Rome was once the center of a vast empire.", category: "history" },
       { _id: "rec33", content: "The violin is a string instrument commonly used in orchestras.", category: "music" },
       { _id: "rec38", content: "The Taj Mahal is a mausoleum built by Emperor Shah Jahan.", category: "history" },
       { _id: "rec48", content: "Vincent van Gogh painted Starry Night.", category: "art" },
       { _id: "rec50", content: "Renewable energy sources include wind, solar, and hydroelectric power.", category: "energy" }
   ];

   // Target the index
   const denseIndex = pc.index("agentic-quickstart-test");

   // Upsert the records into a namespace
   await denseIndex.namespace("example-namespace").upsertRecords(records);
   ```

3. Search the dense index for ten records that are most semantically similar to the query, "Famous historical structures and monuments":

   ```typescript  theme={null}
   // Wait for the upserted vectors to be indexed
   await new Promise(resolve => setTimeout(resolve, 10000));

   // View stats for the index
   const stats = await denseIndex.describeIndexStats();
   console.log(stats);

   // Define the query
   const query = "Famous historical structures and monuments";

   // Search the dense index
   const results = await denseIndex.namespace("example-namespace").searchRecords({
       query: {
           topK: 10,
           inputs: {
               text: query
           }
       }
   });

   // Print the results
   for (const hit of results.result.hits) {
       const fields = hit.fields as Record<string, any>;
       const category = String(fields?.category ?? 'unknown');
       const content = String(fields?.content ?? '');
       console.log(`id: ${hit._id.padEnd(5)} | score: ${hit._score.toFixed(2).padEnd(5)} | category: ${category.padEnd(10)} | text: ${content.substring(0, 50)}`);
   }
   ```

4. Show the search results to the user. Most of the results will be about historical structures and monuments. However, a few unrelated statements will be included as well and ranked high in the list, for example, a statement about Shakespeare. Don't show the literal results in your terminal. Print the important result details in the chat.

5. To get a more accurate ranking, search again but this time rerank the initial results based on their relevance to the query:

   ```typescript  theme={null}
   // Search the dense index and rerank results
   const rerankedResults = await denseIndex.namespace("example-namespace").searchRecords({
       query: {
           topK: 10,
           inputs: {
               text: query
           }
       },
       rerank: {
           model: "bge-reranker-v2-m3",
           topN: 10,
           rankFields: ["content"]
       }
   });

   // Print the reranked results
   for (const hit of rerankedResults.result.hits) {
       const fields = hit.fields as Record<string, any>;
       const category = String(fields?.category ?? 'unknown');
       const content = String(fields?.content ?? '');
       console.log(`id: ${hit._id}, score: ${hit._score.toFixed(2)}, text: ${content}, category: ${category}`);
   }

   // Access search results - CORRECT way with proper type casting
   for (const hit of results.result.hits) {
       const fields = hit.fields as Record<string, any>;  // Cast to typed object
       const docId = hit._id;                              // Property access for id
       const score = hit._score;                           // Property access for score
       const content = String(fields?.content ?? '');      // Safe field access
       const metadata = String(fields?.metadata_field ?? '');  // Use ?? for optional fields
   }
   ```

6. Show the search results to the user. All of the most relevant results about historical structures and monuments will now be ranked highest. Again, don't show the literal results in your terminal. Print the important result details in the chat.

### Build a semantic search system

Complete [Setup Prerequisites](#setup-prerequisites-all-quickstarts) first.

**Step 1. Build a semantic search system**

1. Create an index called "agentic-quickstart-search" with an integrated embedding model that can handle text documents. Use the Pinecone CLI for this. Use the API key env variable to authenticate.

   ```bash  theme={null}
   pc index create -n agentic-quickstart-search -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content
   ```

2. Create 20 unique documents with metadata. Each document should cover a unique foundational AI/ML concept.

3. Store the documents in the Pinecone index. Be sure to use the `upsertRecords()` method not the `upsert()` method.

4. Create a search function that:

   * Uses semantic search to find relevant documents
   * Includes reranking with the hosted bge-reranker-v2-m3 model
   * Allows filtering by metadata
   * Returns well-formatted results
   * Uses production-ready error handling patterns

   Be sure to use the `searchRecords()` method, not the `query()` method.

5. Then search the knowledge base with 3 sample queries.

6. Show the search results to the user. Don't show the literal results in your terminal. Print the important result details in the chat.

7. Provide a summary of what you did including:
   * The production-ready patterns you used
   * A concise explanation of the generated code

### Build a multi-tenant RAG system

Complete [Setup Prerequisites](#setup-prerequisites-all-quickstarts) first (including step 4 for LLM API keys).

This example builds an **Email Management & Search Platform** where each user has isolated access to their own email mailbox—ensuring privacy and data segregation. Each person's email is indexed in its own namespace and they have access only to that namespace.

**Step 1. Build a RAG system**

1. Create an index called "agentic-quickstart-rag" with an integrated embedding model that can handle text documents. Use the Pinecone CLI for this. Use the API key env variable to authenticate.

   ```bash  theme={null}
   pc index create -n agentic-quickstart-rag -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content
   ```

2. Create 20 unique email messages with metadata across four categories:

   * **Work Correspondence** (5 emails): Project updates, meeting notes, team announcements
   * **Project Management** (5 emails): Task assignments, progress reports, deadline reminders
   * **Client Communications** (5 emails): Client requests, proposals, feedback
   * **Administrative** (5 emails): HR notices, policy updates, expense reports

   Each email should include metadata fields:

   * `message_type`: "work", "project", "client", "admin"
   * `priority`: "high", "medium", "low"
   * `from_domain`: "internal", "client", "vendor"
   * `date_received`: ISO date string
   * `has_attachments`: true or false

3. Store the emails in the Pinecone index using separate namespaces for each user (e.g., `user_alice`, `user_bob`). Be sure to use the `upsertRecords()` method not the `upsert()` method.

4. Create a RAG function that:

   * Takes a user query and user identifier as input
   * Searches ONLY the specified user's namespace to ensure data isolation
   * Retrieves relevant emails using semantic search
   * Reranks results with the hosted bge-reranker-v2-m3 model (prioritizing by priority and message\_type)
   * Constructs a prompt with the retrieved email content
   * Sends the prompt to an LLM (use OpenAI GPT-4 or Anthropic Claude)
   * Returns the generated answer with source citations including sender, date, and priority level

   The RAG system should:

   * **Enforce namespace isolation** - never return emails from other users
   * Handle context window limits intelligently
   * Include metadata in citations (message type, date received, priority)
   * Flag high-priority emails in the response
   * Gracefully handle missing or insufficient email context

   Be sure to use the `searchRecords()` method, not the `query()` method.

5. Then answer 3 sample questions as a user querying their email mailbox:
   * "What updates did I receive about the quarterly project?"
   * "Show me all client feedback we've received this month"
   * "Find high-priority emails from my team about the presentation"

6. Give the user insight into the process. Show the search results from Pinecone as well as the answers from the LLM. Don't show the literal results and answers in your terminal. Print the important result and answer details in the chat.

7. Provide a summary of what you did including:
   * The production-ready patterns you used
   * How namespace isolation ensures privacy and data segregation
   * A concise explanation of the generated code

### Build a recommendation engine

Complete [Setup Prerequisites](#setup-prerequisites-all-quickstarts) first.

**Step 1. Build a recommendation engine**

1. Create an index called "agentic-quickstart-recommendations" with an integrated embedding model that can handle text documents. Use the Pinecone CLI for this. Use the API key env variable to authenticate.

   ```bash  theme={null}
   pc index create -n agentic-quickstart-recommendations -m cosine -c aws -r us-east-1 --model llama-text-embed-v2 --field_map text=content
   ```

2. Create 20 diverse product listings with rich metadata.

3. Store the product listings in the Pinecone index. Be sure to use the `upsertRecords()` method not the `upsert()` method.

4. Create a recommendation engine that:

   * Takes a product ID as input and finds similar items.
   * Uses vector similarity to find semantically related products.
   * Allows filtering by category, price range, and other attributes.
   * Implements diversity strategies to limit results per category and score spreading.
   * Aggregates multi-item preferences to generate recommendations.
   * Returns well-formatted recommendations with similarity scores.

   Be sure to use the `searchRecords()` method, not the `query()` method.

5. Then test the recommendation engine with 3 sample products.

6. Show the search results to the user. For each test, explain why these recommendations make sense based on the similarity scores and filters. Don't show the literal results in your terminal. Print the important result details in the chat.

7. Provide a summary of what you did including:
   * The production-ready patterns you used
   * A concise explanation of the generated code

***

## Index creation

> **⚠️ Use CLI (`pc index create`), NOT SDK in application code. See [CLI vs SDK](#cli-vs-sdk-when-to-use-which).**

### Index creation with integrated embeddings (preferred)

```typescript  theme={null}
// Create index with integrated embedding model
const indexName = "my-index";
const indexList = await pc.listIndexes();
const indexExists = indexList.indexes?.some(index => index.name === indexName);

if (!indexExists) {
    await pc.createIndexForModel({
        name: indexName,
        cloud: "aws",  // or "gcp", "azure"
        region: "us-east-1",  // choose based on location
        embed: {
            model: "llama-text-embed-v2",  // recommended for most cases
            fieldMap: { text: "content" }  // maps search field to record field
        }
    });
}

const index = pc.index(indexName);
```

### Available embedding models (current)

* `llama-text-embed-v2`: High-performance, configurable dimensions, recommended for most use cases
* `multilingual-e5-large`: For multilingual content, 1024 dimensions
* `pinecone-sparse-english-v0`: For keyword/hybrid search scenarios

## Data operations

### Upserting records (text with integrated embeddings)

```typescript  theme={null}
// Indexes with integrated embeddings
const records = [
    {
        _id: "doc1",
        content: "Your text content here",  // must match field_map
        category: "documentation",
        created_at: "2025-01-01",
        priority: "high"
    }
];

// Always use namespaces
const namespace = "user_123";  // e.g., "knowledge_base", "session_456"
await index.namespace(namespace).upsertRecords(records);
```

### Updating records

```typescript  theme={null}
// Update existing records (use same upsert operation with existing IDs)
const updatedRecords = [
    {
        _id: "doc1",  // existing record ID
        content: "Updated content here",
        category: "updated_docs",  // can change metadata
        last_modified: "2025-01-15"
    }
];

// Partial updates - only changed fields need to be included
const partialUpdate = [
    {
        _id: "doc1",
        category: "urgent",  // only updating category field
        priority: "high"     // adding new field
    }
];

await index.namespace(namespace).upsertRecords(updatedRecords);
```

### Fetching records

```typescript  theme={null}
// Fetch single record
const result = await index.namespace(namespace).fetch(["doc1"]);
if (result.records && result.records["doc1"]) {
    const record = result.records["doc1"];
    console.log(`Content: ${record.fields.content}`);
    console.log(`Metadata:`, record.metadata);
}

// Fetch multiple records
const multiResult = await index.namespace(namespace).fetch(["doc1", "doc2", "doc3"]);
for (const [recordId, record] of Object.entries(multiResult.records)) {
    console.log(`ID: ${recordId}, Content: ${record.fields.content}`);
}

// Fetch with error handling
async function safeFetch(index, namespace, ids) {
    try {
        const result = await index.namespace(namespace).fetch(ids);
        return result.records;
    } catch (error) {
        console.error(`Fetch failed: ${error}`);
        return {};
    }
}
```

### Listing record IDs

```typescript  theme={null}
// List all record IDs (paginated)
async function listAllIds(index, namespace, prefix = null) {
    // List all record IDs with optional prefix filter
    const allIds = [];
    let paginationToken = null;

    while (true) {
        const result = await index.namespace(namespace).listPaginated({
            prefix: prefix,  // filter by ID prefix
            limit: 1000,
            paginationToken: paginationToken
        });

        allIds.push(...result.vectors.map(record => record.id));

        if (!result.pagination || !result.pagination.next) {
            break;
        }
        paginationToken = result.pagination.next;
    }

    return allIds;
}

// Usage
const allRecordIds = await listAllIds(index, "user_123");
const docsOnly = await listAllIds(index, "user_123", "doc_");
```

***

## Search operations

### Semantic search with reranking (best practice)

```typescript  theme={null}
async function searchWithRerank(index, namespace, queryText, topK = 5) {
    // Standard search pattern - always rerank for production
    const results = await index.namespace(namespace).searchRecords({
        query: {
            topK: topK * 2,  // more candidates for reranking
            inputs: {
                text: queryText  // must match index config
            }
        },
        rerank: {
            model: "bge-reranker-v2-m3",
            topN: topK,
            rankFields: ["content"]
        }
    });
    return results;
}
```

### Lexical search (keyword-based)

```typescript  theme={null}
// Basic lexical search
async function lexicalSearch(index, namespace, queryText, topK = 5) {
    // Keyword-based search using sparse embeddings
    const results = await index.namespace(namespace).searchRecords({
        query: {
            inputs: { text: queryText },
            topK: topK
        }
    });
    return results;
}

// Lexical search with required terms
async function lexicalSearchWithRequiredTerms(index, namespace, queryText, requiredTerms, topK = 5) {
    // Results must contain specific required words
    const results = await index.namespace(namespace).searchRecords({
        query: {
            inputs: { text: queryText },
            topK: topK,
            matchTerms: requiredTerms  // results must contain these terms
        }
    });
    return results;
}

// Lexical search with reranking
async function lexicalSearchWithRerank(index, namespace, queryText, topK = 5) {
    // Lexical search with reranking for better relevance
    const results = await index.namespace(namespace).searchRecords({
        query: {
            inputs: { text: queryText },
            topK: topK * 2  // get more candidates for reranking
        },
        rerank: {
            model: "bge-reranker-v2-m3",
            topN: topK,
            rankFields: ["content"]
        }
    });
    return results;
}

// Example usage
const searchResults = await lexicalSearchWithRequiredTerms(
    index,
    "knowledge_base",
    "machine learning algorithms neural networks",
    ["algorithms"]  // must contain "algorithms"
);
```

### Metadata filtering

```typescript  theme={null}
// Simple filters
const filterCriteria = { category: "documentation" };

// Complex filters
const complexFilter = {
    $and: [
        { category: { $in: ["docs", "tutorial"] } },
        { priority: { $ne: "low" } },
        { created_at: { $gte: "2025-01-01" } }
    ]
};

const results = await index.namespace(namespace).searchRecords({
    query: {
        topK: 10,
        inputs: { text: queryText },
        filter: filterCriteria  // Filter goes inside query object
    }
});
```

### Supported filter operators

* `$eq`: equals
* `$ne`: not equals
* `$gt`, `$gte`: greater than, greater than or equal
* `$lt`, `$lte`: less than, less than or equal
* `$in`: in list
* `$nin`: not in list
* `$exists`: field exists
* `$and`, `$or`: logical operators

***

## 🚨 Common Mistakes (Must Avoid)

### 1. **Nested Metadata** (will cause API errors)

```typescript  theme={null}
// ❌ WRONG - nested objects not allowed
const badRecord = {
    _id: "doc1",
    user: { name: "John", id: 123 },  // Nested
    tags: [{ type: "urgent" }]  // Nested in list
};

// ✅ CORRECT - flat structure only
const goodRecord = {
    _id: "doc1",
    user_name: "John",
    user_id: 123,
    tags: ["urgent", "important"]  // String lists OK
};
```

### 2. **Batch Size Limits** (will cause API errors)

```typescript  theme={null}
// Text records: MAX 96 per batch, 2MB total
// Vector records: MAX 1000 per batch, 2MB total

// ✅ CORRECT - respect limits
for (let i = 0; i < records.length; i += 96) {
    const batch = records.slice(i, i + 96);
    await index.namespace(namespace).upsertRecords(batch);
}
```

### 3. **Missing Namespaces** (causes data isolation issues)

```typescript  theme={null}
// ❌ WRONG - no namespace
await index.upsertRecords(records);  // Old API pattern

// ✅ CORRECT - always use namespaces
await index.namespace("user_123").upsertRecords(records);
await index.namespace("user_123").searchRecords(params);
await index.namespace("user_123").deleteMany(["doc1"]);
```

### 4. **Skipping Reranking** (reduces search quality)

```typescript  theme={null}
// ⚠️ OK but not optimal
const results = await index.namespace("ns").searchRecords({
    query: { topK: 5, inputs: { text: "query" } }
});

// ✅ BETTER - always rerank in production
const rerankedResults = await index.namespace("ns").searchRecords({
    query: {
        topK: 10,
        inputs: { text: "query" }
    },
    rerank: { model: "bge-reranker-v2-m3", topN: 5, rankFields: ["content"] }
});
```

### 5. **Hardcoded API Keys**

```typescript  theme={null}
// ❌ WRONG
const pc = new Pinecone({ apiKey: "pc-abc123..." });

// ✅ CORRECT
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
```

### 6. **Missing Async/Await** (TypeScript-specific)

```typescript  theme={null}
// ❌ WRONG - forgetting await
const results = index.namespace("ns").searchRecords({ query: { topK: 5, inputs: { text: "query" } } });
console.log(results);  // Will log a Promise, not results

// ✅ CORRECT - use await
const results = await index.namespace("ns").searchRecords({ query: { topK: 5, inputs: { text: "query" } } });
console.log(results);
```

***

## ⏳ Indexing Delays & Eventual Consistency (Important!)

Pinecone uses **eventual consistency**. This means records don't immediately appear in searches or stats after upserting.

### Realistic Timing Expectations

| Operation          | Time          | Notes                                       |
| ------------------ | ------------- | ------------------------------------------- |
| Record stored      | 1-3 seconds   | Data is persisted                           |
| Records searchable | 5-10 seconds  | Can find via `searchRecords()`              |
| Stats updated      | 10-20 seconds | `describeIndexStats()` shows accurate count |
| Indexes ready      | 30-60 seconds | New indexes enter "Ready" state             |

### Correct Wait Pattern

```typescript  theme={null}
// Upload records
await index.namespace("ns").upsertRecords(records);

// WRONG - 5 seconds is too short!
// await new Promise(r => setTimeout(r, 5000));

// ✅ CORRECT - wait 10+ seconds
await new Promise(r => setTimeout(r, 10000));

// Now search will work
const results = await index.namespace("ns").searchRecords({ ... });
```

### Production Pattern: Polling for Readiness

```typescript  theme={null}
async function waitForRecords(
    index: Index,
    namespace: string,
    expectedCount: number,
    maxWaitSeconds = 300
): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitSeconds * 1000) {
        const stats = await index.describeIndexStats();
        const count = stats.namespaces?.[namespace]?.recordCount ?? 0;
        
        if (count >= expectedCount) {
            console.log(`✓ All ${count} records indexed`);
            return;
        }
        
        console.log(`⏳ Indexed ${count}/${expectedCount} records, waiting...`);
        await new Promise(r => setTimeout(r, 5000));  // Check every 5 seconds
    }
    
    throw new Error(
        `Timeout: Records not fully indexed after ${maxWaitSeconds}s`
    );
}

// Usage
await index.namespace("ns").upsertRecords(records);
await waitForRecords(index, "ns", records.length);
```

## 🆘 Troubleshooting

### Problem: `describeIndexStats()` returns 0 records after upsert

**Cause**: Eventual consistency - records haven't indexed yet
**Solution**:

1. Wait 10+ seconds minimum
2. Check if records were actually upserted (no errors thrown)
3. Use the polling pattern above for production code

### Problem: Search returns no results

**Cause**: Usually one of these:

1. Field name mismatch (using wrong field in `--field_map`)
2. Records not indexed yet (use polling pattern)
3. Empty namespace or wrong namespace name
4. Filtering too aggressively

**Solution**:

```typescript  theme={null}
// 1. Verify field_map matches your records
// If you created index with --field_map text=content
// Make sure records have "content" field, not "text"

// 2. Check if records exist
const allIds = await index.namespace("ns").listPaginated({ limit: 10 });
console.log("First 10 IDs:", allIds.vectors.map(v => v.id));

// 3. Try simple search without filters
const anyResults = await index.namespace("ns").searchRecords({
    query: { topK: 5, inputs: { text: "query" } }
    // No filter to start
});
```

### Problem: TypeScript errors accessing hit.fields

**Cause**: SDK returns generic object, TypeScript doesn't know your field names
**Solution**: Use type casting

```typescript  theme={null}
const fields = hit.fields as Record<string, any>;
const content = String(fields?.content ?? '');
```

***

## Key Constraints

| Constraint          | Limit                                      | Notes                                      |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| Metadata per record | 40KB                                       | Flat JSON only, no nested objects          |
| Text batch size     | 96 records                                 | Also 2MB total per batch                   |
| Vector batch size   | 1000 records                               | Also 2MB total per batch                   |
| Query response size | 4MB                                        | Per query response                         |
| Metadata types      | strings, ints, floats, bools, string lists | No nested structures                       |
| Consistency         | Eventually consistent                      | 5-10s search, 10-20s for stats (not 1-5s!) |

***

## Error Handling (Production)

### Error Types

* **4xx (client errors)**: Fix your request - DON'T retry (except 429)
* **429 (rate limit)**: Retry with exponential backoff
* **5xx (server errors)**: Retry with exponential backoff

### Simple Retry Pattern

```typescript  theme={null}
async function exponentialBackoffRetry<T>(
    func: () => Promise<T>,
    maxRetries = 5
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await func();
        } catch (error: any) {
            const statusCode = error.status || error.statusCode;

            // Only retry transient errors
            if (statusCode && (statusCode >= 500 || statusCode === 429)) {
                if (attempt < maxRetries - 1) {
                    const delay = Math.min(2 ** attempt * 1000, 60000);  // Exponential backoff, cap at 60s
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            } else {
                throw error;  // Don't retry client errors (4xx except 429)
            }
        }
    }
    throw new Error("Max retries exceeded");
}

// Usage
await exponentialBackoffRetry(async () =>
    await index.namespace(namespace).upsertRecords(records)
);
```

***

## Common Operations Cheat Sheet

### Index Management

**⚠️ Important**: For administrative tasks (create, configure, delete indexes), prefer the **Pinecone CLI** over the SDK. Use the SDK only when you need to check index existence or get stats programmatically in your application code.

**Use CLI for these operations:**

```bash  theme={null}
# Create index with integrated embeddings (recommended, one-time setup)
pc index create --name my-index --dimension 1536 --metric cosine \
  --cloud aws --region us-east-1 \
  --model llama-text-embed-v2 \
  --field_map text=content

# Create serverless index without integrated embeddings (if you need custom embeddings)
pc index create-serverless --name my-index --dimension 1536 --metric cosine \
  --cloud aws --region us-east-1

# List indexes
pc index list

# Describe index
pc index describe --name my-index

# Configure index
pc index configure --name my-index --replicas 3

# Delete index
pc index delete --name my-index
```

**Use SDK only for programmatic checks in application code:**

```typescript  theme={null}
// Check if index exists (in application startup)
const indexList = await pc.listIndexes();
const indexExists = indexList.indexes?.some(idx => idx.name === "my-index");
if (indexExists) {
    const index = pc.index("my-index");
}

// Get stats (for monitoring/metrics)
const stats = await index.describeIndexStats();
console.log(`Total vectors: ${stats.totalRecordCount}`);
console.log(`Namespaces: ${Object.keys(stats.namespaces || {})}`);
```

**❌ Avoid in application code:**

```typescript  theme={null}
// Don't create indexes in application code - use CLI instead
await pc.createIndex(...)  // Use: pc index create ...
await pc.createIndexForModel(...)  // Use: pc index create ... (with --model flag)

// Don't delete indexes in application code - use CLI instead
await pc.deleteIndex("my-index")  // Use: pc index delete --name my-index

// Don't configure indexes in application code - use CLI instead
await pc.configureIndex("my-index", { replicas: 3 })  // Use: pc index configure ...
```

### Data Operations

```typescript  theme={null}
// Fetch records
const result = await index.namespace("ns").fetch(["doc1", "doc2"]);
for (const [recordId, record] of Object.entries(result.records)) {
    console.log(`${recordId}: ${record.values}`);
}

// List all IDs (paginated)
const allIds = [];
let paginationToken = null;
while (true) {
    const result = await index.namespace("ns").listPaginated({
        limit: 1000,
        paginationToken
    });
    allIds.push(...result.vectors.map(r => r.id));
    if (!result.pagination || !result.pagination.next) {
        break;
    }
    paginationToken = result.pagination.next;
}

// Delete records
await index.namespace("ns").deleteMany(["doc1", "doc2"]);

// Delete entire namespace
await index.namespace("ns").deleteAll();
```

### Search with Filters

```typescript  theme={null}
// Metadata filtering - IMPORTANT: Only include "filter" key if you have filters
// Don't set filter to undefined - omit the key entirely
const results = await index.namespace("ns").searchRecords({
    query: {
        topK: 10,
        inputs: { text: "query" },
        filter: {
            $and: [
                { category: { $in: ["docs", "tutorial"] } },
                { priority: { $ne: "low" } },
                { created_at: { $gte: "2025-01-01" } }
            ]
        }
    },
    rerank: { model: "bge-reranker-v2-m3", topN: 5, rankFields: ["content"] }
});

// Search without filters - omit the "filter" key
const simpleResults = await index.namespace("ns").searchRecords({
    query: {
        topK: 10,
        inputs: { text: "query" }
        // No filter key at all
    }
});

// Dynamic filter pattern - conditionally add filter to query object
const queryOptions: any = {
    topK: 10,
    inputs: { text: "query" }
};
if (hasFilters) {  // Only add filter if it exists
    queryOptions.filter = { category: { $eq: "docs" } };
}

const dynamicResults = await index.namespace("ns").searchRecords({ query: queryOptions });

// Filter operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists, $and, $or
```

***

## Recommended Patterns

### Namespace Strategy

```typescript  theme={null}
// Multi-user apps
const namespace = `user_${userId}`;

// Session-based
const namespace = `session_${sessionId}`;

// Content-based
const namespace = "knowledge_base";
const namespace = "chat_history";
```

### Batch Processing

```typescript  theme={null}
async function batchUpsert(index, namespace, records, batchSize = 96) {
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await exponentialBackoffRetry(async () =>
            await index.namespace(namespace).upsertRecords(batch)
        );
        await new Promise(resolve => setTimeout(resolve, 100));  // Rate limiting
    }
}
```

### Environment Config

```typescript  theme={null}
class PineconeClient {
    private pc: Pinecone;
    private indexName: string;

    constructor() {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) {
            throw new Error("PINECONE_API_KEY required");
        }
        this.pc = new Pinecone({ apiKey });
        this.indexName = process.env.PINECONE_INDEX || "default-index";
    }

    getIndex() {
        return this.pc.index(this.indexName);
    }
}
```

***

## Embedding Models (2025)

**Integrated embeddings** (recommended - Pinecone handles embedding):

* `llama-text-embed-v2`: High-performance, recommended for most cases
* `multilingual-e5-large`: Multilingual content (1024 dims)
* `pinecone-sparse-english-v0`: Keyword/hybrid search

**Use integrated embeddings** - don't generate vectors manually unless you have a specific reason.

***

## Official Documentation Resources

For advanced features not covered in this quick reference:

* **API reference**: [https://docs.pinecone.io/reference/api/introduction](https://docs.pinecone.io/reference/api/introduction)
* **Bulk imports** (S3/GCS): [https://docs.pinecone.io/guides/index-data/import-data](https://docs.pinecone.io/guides/index-data/import-data)
* **Hybrid search**: [https://docs.pinecone.io/guides/search/hybrid-search](https://docs.pinecone.io/guides/search/hybrid-search)
* **Back ups** (backup/restore): [https://docs.pinecone.io/guides/manage-data/backups-overview](https://docs.pinecone.io/guides/manage-data/backups-overview)
* **Error handling**: [https://docs.pinecone.io/guides/production/error-handling](https://docs.pinecone.io/guides/production/error-handling)
* **Database limits**: [https://docs.pinecone.io/reference/api/database-limits](https://docs.pinecone.io/reference/api/database-limits)
* **Production monitoring**: [https://docs.pinecone.io/guides/production/monitoring](https://docs.pinecone.io/guides/production/monitoring)
* **TypeScript SDK docs**: [https://sdk.pinecone.io/typescript/](https://sdk.pinecone.io/typescript/)
* **TypeScript SDK GitHub**: [https://github.com/pinecone-io/pinecone-ts-client](https://github.com/pinecone-io/pinecone-ts-client)

***

## Quick Troubleshooting

| Issue                                              | Solution                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `Cannot find module '@pinecone-database/pinecone'` | Wrong package - install with `npm install @pinecone-database/pinecone` |
| `Metadata too large` error                         | Check 40KB limit, flatten nested objects                               |
| `Batch too large` error                            | Reduce to 96 records (text) or 1000 (vectors)                          |
| Search returns no results                          | Check namespace, wait for indexing (\~5s), verify data exists          |
| Rate limit (429) errors                            | Implement exponential backoff, reduce request rate                     |
| Nested metadata error                              | Flatten all metadata - no nested objects allowed                       |
| TypeScript compilation errors                      | Check TypeScript version (4.1+), verify types are installed            |
| Promise rejection errors                           | Always use `await` or `.catch()` for async operations                  |

***

**Remember**: Always use namespaces, always rerank, always handle errors with retry logic, always use async/await.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.pinecone.io/llms.txt