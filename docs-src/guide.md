# Guide

`@rumbor/crane-sdk-node` is the Node.js/TypeScript client for the Rumbor Crane Engine HTTP API. It is a thin, provider-neutral wrapper: it talks only to the versioned Rumbor Crane Engine HTTP contract and does not import Honcho, SurrealDB, SurrealQL, PostgreSQL, or Redis.

> Renamed from `@rumbor/memory-sdk` (ADR-032, 2026-09-02). See the [README](../README.md) for migration notes.

## Install

```bash
npm install @rumbor/crane-sdk-node
```

## Authentication

Rumbor Crane Engine servers authenticate requests with a single Bearer credential. The server maps each configured API key to a principal UUID via its `RUMBOR_AUTH_KEYS` configuration (a JSON object of `{"<key>": "<principal-uuid>"}` pairs) - see the server's [API key authentication reference](https://github.com/rumbor-io/rumbor-crane-engine/blob/develop/docs/api-key-authentication.md) for the full authorization model, including how context membership works.

From the client side, pass the key as `apiKey` when constructing a client:

```ts
const crane = new RumborCrane({
  baseUrl: 'https://crane.example.com',
  apiKey: process.env.RUMBOR_API_KEY,
});
```

The SDK sends it as `Authorization: Bearer <apiKey>` on every request. A missing, malformed, unknown, or duplicated credential returns a `401` response, which the SDK surfaces as a {@link RumborCraneError}.

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
```

`context` is a caller-chosen identifier scoping data (e.g. a workspace, tenant, or session group). The first successful write to a context establishes the calling principal's membership in it automatically; see the authentication reference for the full rule, including how additional principals are granted access.

## Error handling

Every method rejects with a {@link RumborCraneError} when the server responds with a non-2xx status. It carries the HTTP `status` and the parsed response `body`:

```ts
import { RumborCrane, RumborCraneError } from '@rumbor/crane-sdk-node';

try {
  await crane.recall({ context: 'acme-prod', query: 'anything' });
} catch (err) {
  if (err instanceof RumborCraneError) {
    console.error(err.status, err.body);
  }
}
```

## Custom `fetch`

Pass a `fetch` implementation (e.g. for testing, proxying, or a non-standard runtime) via the `fetch` option:

```ts
const crane = new RumborCrane({
  baseUrl: 'http://localhost:8080',
  apiKey: 'test-key',
  fetch: myCustomFetch,
});
```

## API reference

See the sidebar for the full generated reference, including every method on {@link RumborCrane}, the {@link RumborCraneError} shape, and every input/output type.
