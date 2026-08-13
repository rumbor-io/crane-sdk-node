# @rumbor/memory-sdk

Node.js/TypeScript client for [Rumbor Memory](https://github.com/rumbor-io) - a memory engine for agent applications.

Full API reference and guide: [rumbor-io.github.io/rumbor-memory-sdk](https://rumbor-io.github.io/rumbor-memory-sdk/)

This repository holds the public Node SDK's source. The Rumbor Memory server engine (`rumbor-memoryd`), its domain logic, and persistence layer live in a separate private repository - this package is only a thin, provider-neutral HTTP client for the public API contract.

## Install

```bash
npm install @rumbor/memory-sdk
```

## Quickstart

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

## Development

```bash
npm install
npm run build       # compile TypeScript
npm test            # build + run tests
npm run typecheck   # type-check only
npm run docs        # generate the TypeDoc API reference into docs-dist/
```

## OpenAPI contract

`openapi/rumbor-memory.yaml` is a vendored copy of the contract from the private `rumbor-io/rumbor-memory` repository, which remains the canonical source. This repo has no live reference or network access into that repository - the copy here is updated deliberately by a maintainer via `scripts/sync-contract.sh` ahead of any SDK release that depends on a contract change.

To regenerate the SDK's wire types from the vendored contract:

```bash
npm run generate
```

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).
