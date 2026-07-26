import assert from 'node:assert/strict';
import test from 'node:test';

import { RumborMemory, RumborMemoryError } from '../dist/index.js';

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

test('submitTurn shapes URL, auth, and body', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		apiKey: 'principal-id',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ turnId: 'turn-id' }, 201);
		},
	});

	const result = await client.submitTurn({
		context: 'team/main',
		sessionId: 'session-id',
		sourceId: 'source-id',
		content: 'hello',
		assertion: {
			content: 'likes coffee',
			category: 'Knowledge',
			confidence: 0.9,
		},
	});

	assert.deepEqual(result, { turnId: 'turn-id' });
	assert.equal(request.url, 'https://memory.example/api/v1/team%2Fmain/turns');
	assert.equal(request.method, 'POST');
	assert.equal(request.headers.get('content-type'), 'application/json');
	assert.equal(request.headers.get('authorization'), 'Bearer principal-id');
	assert.deepEqual(await request.clone().json(), {
		sessionId: 'session-id',
		sourceId: 'source-id',
		content: 'hello',
		assertion: {
			content: 'likes coffee',
			category: 'Knowledge',
			confidence: 0.9,
		},
	});
});

test('recall shapes query request', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.recall({ context: 'context-id', query: 'coffee', limit: 5 });

	assert.equal(request.url, 'https://memory.example/api/v1/context-id/query');
	assert.equal(request.method, 'POST');
	assert.deepEqual(await request.clone().json(), { query: 'coffee', limit: 5 });
	assert.equal(request.headers.get('authorization'), null);
});

test('getContext shapes GET request', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.getContext({ context: 'context/id' });

	assert.equal(request.url, 'https://memory.example/api/v1/context%2Fid/context');
	assert.equal(request.method, 'GET');
});

test('recall shapes validAt and knownAt into the request body', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.recall({
		context: 'context-id',
		query: 'coffee',
		validAt: '2026-01-01T00:00:00Z',
		knownAt: '2026-01-02T00:00:00Z',
	});

	assert.deepEqual(await request.clone().json(), {
		query: 'coffee',
		validAt: '2026-01-01T00:00:00Z',
		knownAt: '2026-01-02T00:00:00Z',
	});
});

test('getContext shapes validAt and knownAt into the query string', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.getContext({
		context: 'context-id',
		validAt: '2026-01-01T00:00:00Z',
		knownAt: '2026-01-02T00:00:00Z',
	});

	const url = new URL(request.url);
	assert.equal(url.pathname, '/api/v1/context-id/context');
	assert.equal(url.searchParams.get('validAt'), '2026-01-01T00:00:00Z');
	assert.equal(url.searchParams.get('knownAt'), '2026-01-02T00:00:00Z');
});

test('submitTurn shapes supersedes into the assertion body', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ turnId: 'turn-id' }, 201);
		},
	});

	await client.submitTurn({
		context: 'context-id',
		sessionId: 'session-id',
		sourceId: 'source-id',
		content: 'hello',
		assertion: {
			content: 'likes coffee',
			category: 'Knowledge',
			confidence: 0.9,
			supersedes: '00000000-0000-0000-0000-0000000000aa',
		},
	});

	const body = await request.clone().json();
	assert.equal(body.assertion.supersedes, '00000000-0000-0000-0000-0000000000aa');
});

test('getHealth shapes GET request', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example/',
		fetch: async (req) => {
			request = req;
			return jsonResponse({ status: 'ok' });
		},
	});

	const result = await client.getHealth();

	assert.equal(request.url, 'https://memory.example/health');
	assert.equal(request.method, 'GET');
	assert.deepEqual(result, { status: 'ok' });
});

test('getReadiness surfaces 503 as a typed error', async () => {
	const client = new RumborMemory({
		baseUrl: 'https://memory.example',
		fetch: async () => jsonResponse({ status: 'not_ready' }, 503),
	});

	await assert.rejects(
		client.getReadiness(),
		(error) => error instanceof RumborMemoryError && error.status === 503,
	);
});

for (const [status, code] of [
	[401, 'unauthorized'],
	[403, 'forbidden'],
]) {
	test(`${status} response throws typed error`, async () => {
		const client = new RumborMemory({
			baseUrl: 'https://memory.example',
			fetch: async () => jsonResponse({ error: code }, status),
		});

		await assert.rejects(
			client.getContext({ context: 'context-id' }),
			(error) =>
				error instanceof RumborMemoryError &&
				error.status === status &&
				assert.deepEqual(error.body, { error: code }) === undefined,
		);
	});
}
