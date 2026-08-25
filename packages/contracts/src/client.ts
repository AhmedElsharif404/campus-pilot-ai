export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  idempotencyKey?: string;
  csrfToken?: string;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`CampusPilot API request failed (${status})`);
  }
}

export class CampusPilotClient {
  constructor(private readonly baseUrl = "/api/v1") {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body !== undefined)
      headers.set("Content-Type", "application/json");
    if (options.idempotencyKey)
      headers.set("Idempotency-Key", options.idempotencyKey);
    if (options.csrfToken) headers.set("X-CSRF-Token", options.csrfToken);
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (!response.ok) {
      const detail: unknown = await response
        .json()
        .catch(() => response.statusText);
      throw new ApiError(response.status, detail);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}
