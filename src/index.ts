export interface RumborMemoryOptions {
	baseUrl: string;
	apiKey?: string;
	fetch?: typeof globalThis.fetch;
}

export interface RecallInput {
	context: string;
	query: string;
	limit?: number;
}

export interface MemoryRecord {
	id: string;
	content: string;
	category?: string;
	confidence?: number;
	trust?: number;
}

export interface RecallResponse {
	results: MemoryRecord[];
	traceId: string;
}

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
	private readonly fetchImpl: typeof globalThis.fetch;
	private readonly apiKey?: string;
	private readonly baseUrl: string;

	constructor(options: RumborMemoryOptions) {
		this.baseUrl = options.baseUrl.replace(/\/$/, '');
		this.apiKey = options.apiKey;
		this.fetchImpl = options.fetch ?? globalThis.fetch;
	}

	async recall(input: RecallInput): Promise<RecallResponse> {
		const response = await this.fetchImpl(
			`${this.baseUrl}/api/v1/${encodeURIComponent(input.context)}/query`,
			{
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
				},
				body: JSON.stringify({ query: input.query, limit: input.limit }),
			},
		);

		const body = await response.json().catch(() => undefined);
		if (!response.ok) throw new RumborMemoryError(response.status, body);
		return body as RecallResponse;
	}
}
