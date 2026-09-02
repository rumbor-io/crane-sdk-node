# @rumbor/crane-sdk-node

Node.js/TypeScript client for [Rumbor Crane Engine](https://github.com/rumbor-io) - a memory engine for agent applications.

Full API reference and guide: [rumbor-io.github.io/crane-sdk-node](https://rumbor-io.github.io/crane-sdk-node/)

This repository holds the public Node SDK's source. The Rumbor Crane Engine server (`rumbor-craned`), its domain logic, and persistence layer live in a separate private repository (`rumbor-io/rumbor-crane-engine`) - this package is only a thin, provider-neutral HTTP client for the public API contract.

> Renamed from `@rumbor/memory-sdk` (ADR-032, 2026-09-02). `@rumbor/memory-sdk` is deprecated but remains installed for existing consumers; migrate by installing this package and renaming `RumborMemory`/`RumborMemoryError`/`RumborMemoryOptions` to `RumborCrane`/`RumborCraneError`/`RumborCraneOptions` - the rest of the API is unchanged.

## Install

```bash
npm install @rumbor/crane-sdk-node
```

## Quickstart

```ts
import { RumborCrane } from '@rumbor/crane-sdk-node';

const crane = new RumborCrane({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.RUMBOR_API_KEY,
});

const result = await crane.recall({
  context: 'acme-prod',
  query: 'When does the team deploy?',
});

await crane.grantMembership({
  context: 'acme-prod',
  principalId: 'a5e3a6b6-2f0a-4f3e-9c1a-8a7b6b3c9d10',
});
```

All methods (`getHealth`, `getReadiness`, `submitTurn`, `recall`, `getContext`, `grantMembership`) map 1:1 to the versioned OpenAPI contract in `openapi/crane-engine.yaml`.

This package talks only to the Rumbor HTTP contract. It does not import Honcho, SurrealDB, SurrealQL, PostgreSQL, or Redis.

## Development

```bash
npm install
npm run build       # compile TypeScript
npm test            # build + run tests
npm run typecheck   # type-check only
npm run docs        # generate the TypeDoc API reference into docs-dist/
```

`openapi/crane-engine.yaml` is a vendored copy of the contract from the private `rumbor-io/rumbor-crane-engine` repository, which remains the canonical source. This repo has no live reference or network access into that repository - the copy here is updated deliberately by a maintainer via `scripts/sync-contract.sh` ahead of any SDK release that depends on a contract change.

To regenerate the SDK's wire types from the vendored contract:

```bash
npm run generate
```

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).
