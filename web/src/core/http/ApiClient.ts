export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Singleton HTTP client.
 * Todas as requisições usam credentials: 'include' para enviar o cookie de sessão
 * (que chega ao Express via o proxy de rewrites configurado no next.config.ts).
 */
export class ApiClient {
    private static instance: ApiClient | null = null;

    private constructor(private readonly baseUrl: string) {}

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            // baseUrl vazio = mesma origem (Next.js proxeia /api/* para o Express)
            ApiClient.instance = new ApiClient('');
        }
        return ApiClient.instance;
    }

    async get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    async post<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>(path, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }

    private async request<T>(path: string, init: RequestInit): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            credentials: 'include',
        });

        if (!res.ok) {
            let message = `HTTP ${res.status}`;
            try {
                const body = await res.json() as { error?: string };
                if (body.error) message = body.error;
            } catch { /* resposta sem JSON */ }
            throw new ApiError(res.status, message);
        }

        // 204 No Content — retorna undefined como T
        if (res.status === 204) return undefined as T;
        return res.json() as Promise<T>;
    }
}
