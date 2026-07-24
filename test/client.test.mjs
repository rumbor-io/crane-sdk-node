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
		fetch: async (url, init) => {
			request = { url, init };
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
	assert.equal(request.init.method, 'POST');
	assert.deepEqual(request.init.headers, {
		'content-type': 'application/json',
		authorization: 'Bearer principal-id',
	});
	assert.deepEqual(JSON.parse(request.init.body), {
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
		baseUrl: 'https://memory.example',
		fetch: async (url, init) => {
			request = { url, init };
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.recall({ context: 'context-id', query: 'coffee', limit: 5 });

	assert.equal(request.url, 'https://memory.example/api/v1/context-id/query');
	assert.equal(request.init.method, 'POST');
	assert.deepEqual(JSON.parse(request.init.body), { query: 'coffee', limit: 5 });
	assert.equal(request.init.headers.authorization, undefined);
});

test('getContext shapes GET request', async () => {
	let request;
	const client = new RumborMemory({
		baseUrl: 'https://memory.example',
		fetch: async (url, init) => {
			request = { url, init };
			return jsonResponse({ results: [], traceId: 'trace-id' });
		},
	});

	await client.getContext('context/id');

	assert.equal(request.url, 'https://memory.example/api/v1/context%2Fid/context');
	assert.equal(request.init.method, undefined);
});

test('non-success response throws typed error', async () => {
	const client = new RumborMemory({
		baseUrl: 'https://memory.example',
		fetch: async () => jsonResponse({ error: 'unauthorized' }, 403),
	});

	await assert.rejects(
		client.getContext('context-id'),
		(error) =>
			error instanceof RumborMemoryError &&
			error.status === 403 &&
			assert.deepEqual(error.body, { error: 'unauthorized' }) === undefined,
	);
});
