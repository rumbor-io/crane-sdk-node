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

export interface TurnInput {
	context: string;
	sessionId: string;
	sourceId: string;
	content: string;
	assertion?: AssertionInput;
}

export interface AssertionInput {
	content: string;
	category: 'Episodic' | 'Identity' | 'Knowledge' | 'Context' | 'Instructions' | 'Uncertainty';
	confidence: number;
}

export interface TurnResponse {
	turnId: string;
}

export interface MemoryRecord {
	id: string;
	content: string;
	category: string;
	confidence: number;
	trust: number;
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

	async submitTurn(input: TurnInput): Promise<TurnResponse> {
		const response = await this.fetchImpl(
			`${this.baseUrl}/api/v1/${encodeURIComponent(input.context)}/turns`,
			{
				method: 'POST',
				headers: this.headers(),
				body: JSON.stringify({
					sessionId: input.sessionId,
					sourceId: input.sourceId,
					content: input.content,
					assertion: input.assertion,
				}),
			},
		);
		return this.parseResponse(response);
	}

	async recall(input: RecallInput): Promise<RecallResponse> {
		const response = await this.fetchImpl(
			`${this.baseUrl}/api/v1/${encodeURIComponent(input.context)}/query`,
			{
				method: 'POST',
				headers: this.headers(),
				body: JSON.stringify({ query: input.query, limit: input.limit }),
			},
		);
		return this.parseResponse(response);
	}

	async getContext(context: string): Promise<RecallResponse> {
		const response = await this.fetchImpl(
			`${this.baseUrl}/api/v1/${encodeURIComponent(context)}/context`,
			{ headers: this.headers() },
		);
		return this.parseResponse(response);
	}

	private headers(): Record<string, string> {
		return {
			'content-type': 'application/json',
			...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
		};
	}

	private async parseResponse<T>(response: Response): Promise<T> {
		const body = await response.json().catch(() => undefined);
		if (!response.ok) throw new RumborMemoryError(response.status, body);
		return body as T;
	}
}
