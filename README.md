# @rumbor/memory-sdk

Node.js/TypeScript client for Rumbor Memory API.

```ts
import { RumborMemory } from '@rumbor/memory-sdk';

const memory = new RumborMemory({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.RUMBOR_API_KEY,
});

const result = await memory.recall({
  context: 'acme-prod',
  query: 'When does the team deploy?',
});
```

This package talks only to the Rumbor HTTP contract. It does not import Honcho, SurrealDB, SurrealQL, PostgreSQL, or Redis.
