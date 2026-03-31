/**
 * Shared API client utilities for external data source requests.
 * Handles rate limiting, retries, error handling, and response normalization.
 */

const USER_AGENT = "MineralScope/1.0 (critical-minerals-osint-prototype; contact@mineralscope.dev)";

interface FetchOptions extends RequestInit {
  /** Timeout in milliseconds (default 15000) */
  timeout?: number;
  /** Number of retries on failure (default 1) */
  retries?: number;
}

/**
 * Fetch wrapper with timeout, retries, and error normalization.
 */
export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 15000, retries = 1, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", USER_AGENT);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch JSON with type inference.
 */
export async function fetchJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await apiFetch(url, options);
  return response.json() as Promise<T>;
}

/**
 * Simple in-memory cache with TTL.
 */
const cache = new Map<string, { data: unknown; expires: number }>();

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

/**
 * Build URL with query parameters, filtering out undefined/null values.
 */
export function buildURL(base: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
