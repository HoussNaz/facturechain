export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

type ApiOptions = {
  method?: string;
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { ...(options.headers || {}) };
  const init: RequestInit = {
    method: options.method || "GET",
    headers
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      init.body = options.body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const err = new Error(data?.message || response.statusText);
    (err as any).status = response.status;
    throw err;
  }

  return data as T;
}

