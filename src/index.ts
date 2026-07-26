import createClient, { type Client } from 'openapi-fetch';

import type { components, paths } from './generated/schema.js';

export interface RumborMemoryOptions {
	baseUrl: string;
	apiKey?: string;
	fetch?: typeof globalThis.fetch;
}

export interface RecallInput {
	context: string;
	query: string;
	limit?: number;
	validAt?: string;
	knownAt?: string;
}

export interface TurnInput {
	context: string;
	sessionId: string;
	sourceId: string;
	content: string;
	assertion?: AssertionInput;
}

export interface ContextInput {
	context: string;
	validAt?: string;
	knownAt?: string;
}

export type AssertionInput = components['schemas']['AssertionInput'];
export type TurnResponse = components['schemas']['TurnResponse'];
export type MemoryRecord = components['schemas']['MemoryRecord'];
export type RecallResponse = components['schemas']['RecallResponse'];
export type StatusResponse = components['schemas']['StatusResponse'];

export class RumborMemoryError extends Error {
	constructor(
		readonly status: number,
		readonly body: unknown,
	) {
		super(`Rumbor Memory request failed with status ${status}`);
		this.name = 'RumborMemoryError';
	}
}
export class RumborMemory {
	private readonly client: Client<paths>;

	constructor(options: RumborMemoryOptions) {
		this.client = createClient<paths>({
			baseUrl: options.baseUrl.replace(/\/$/, ''),
			fetch: options.fetch ?? globalThis.fetch,
			headers: options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : undefined,
		});
	}

	async getHealth(): Promise<StatusResponse> {
		const { data, error, response } = await this.client.GET('/health');
		return this.unwrap(data, error, response);
	}

	async getReadiness(): Promise<StatusResponse> {
		const { data, error, response } = await this.client.GET('/ready');
		return this.unwrap(data, error, response);
	}

	async submitTurn(input: TurnInput): Promise<TurnResponse> {
		const { data, error, response } = await this.client.POST('/api/v1/{context}/turns', {
			params: { path: { context: input.context } },
			body: {
				sessionId: input.sessionId,
				sourceId: input.sourceId,
				content: input.content,
				assertion: input.assertion,
			},
		});
		return this.unwrap(data, error, response);
	}

	async recall(input: RecallInput): Promise<RecallResponse> {
		const { data, error, response } = await this.client.POST('/api/v1/{context}/query', {
			params: { path: { context: input.context } },
			body: {
				query: input.query,
				limit: input.limit,
				validAt: input.validAt,
				knownAt: input.knownAt,
			},
		});
		return this.unwrap(data, error, response);
	}

	async getContext(input: ContextInput): Promise<RecallResponse> {
		const { data, error, response } = await this.client.GET('/api/v1/{context}/context', {
			params: {
				path: { context: input.context },
				query: { validAt: input.validAt, knownAt: input.knownAt },
			},
		});
		return this.unwrap(data, error, response);
	}

	private unwrap<T>(data: T | undefined, error: unknown, response: Response): T {
		if (!response.ok) throw new RumborMemoryError(response.status, error);
		return data as T;
	}
}
