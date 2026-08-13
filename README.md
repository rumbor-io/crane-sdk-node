# @rumbor/memory-sdk

Full API reference and guide: [rumbor-io.github.io/rumbor-memory](https://rumbor-io.github.io/rumbor-memory/)

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

await memory.grantMembership({
  context: 'acme-prod',
  principalId: 'a5e3a6b6-2f0a-4f3e-9c1a-8a7b6b3c9d10',
});
```

All methods (`getHealth`, `getReadiness`, `submitTurn`, `recall`, `getContext`, `grantMembership`) map 1:1 to the versioned OpenAPI contract in `openapi/rumbor-memory.yaml`.

This package talks only to the Rumbor HTTP contract. It does not import Honcho, SurrealDB, SurrealQL, PostgreSQL, or Redis.
