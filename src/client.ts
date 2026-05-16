export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export class ClawdCallApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`ClawdCall API request failed with status ${status}: ${body}`);
    this.name = "ClawdCallApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ClawdCallClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class ClawdCallClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(options: ClawdCallClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? "https://api.clawdcall.com");
  }

  async get(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    return this.request("GET", path, undefined, query, options);
  }

  async post(path: string, body?: JsonObject, options?: RequestOptions): Promise<JsonValue> {
    return this.request("POST", path, body, undefined, options);
  }

  async patch(path: string, body?: JsonObject, options?: RequestOptions): Promise<JsonValue> {
    return this.request("PATCH", path, body, undefined, options);
  }

  async delete(path: string, options?: RequestOptions): Promise<JsonValue> {
    return this.request("DELETE", path, undefined, undefined, options);
  }

  private async request(
    method: string,
    path: string,
    body?: JsonObject,
    query?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions,
  ): Promise<JsonValue> {
    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    const authenticated = options?.authenticated ?? true;

    if (authenticated && !this.apiKey) {
      throw new Error("CLAWDCALL_API_KEY is required for this tool");
    }

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...(authenticated ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        "Content-Type": "application/json",
        "User-Agent": "clawdcall-mcp/0.1.0",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new ClawdCallApiError(response.status, text);
    }

    if (!text) {
      return null;
    }

    return JSON.parse(text) as JsonValue;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

interface RequestOptions {
  authenticated?: boolean;
}
