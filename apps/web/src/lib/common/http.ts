import { error } from '@sveltejs/kit';
import qs, { type ParsedQs } from 'qs';

export type ApiFailure = { ok: false; status: number; message: string; body: Record<string, unknown> };
export type ApiSuccess<T> = { ok: true; status: number; data: T };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type Id = string | number;

function origin(): string {
  if (typeof window !== 'undefined') return '';
  return process.env.API_ORIGIN || (import.meta.env.DEV ? 'http://127.0.0.1:8080' : '');
}

export function queryString(params: Record<string, unknown>): string {
  return qs.stringify(params, {
    addQueryPrefix: true,
    skipNulls: true,
    filter: (prefix, value) => {
      if (prefix !== '' && value === '') return undefined;
      return value;
    },
  });
}

export function queryParams(input: string | URL | URLSearchParams): ParsedQs {
  const raw = input instanceof URL ? input.search : input instanceof URLSearchParams ? input.toString() : input;
  return qs.parse(raw, { ignoreQueryPrefix: true });
}

export function queryValue(params: ParsedQs, key: string): string {
  const value = params[key];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string');
    return typeof first === 'string' ? first : '';
  }
  return '';
}

export function pathId(id: Id): string {
  return encodeURIComponent(String(id));
}

export type SendOptions = {
  queryParams: Record<string, unknown> | null;
  body: object | null;
};

export async function sendGet<T>(path: string, init: SendOptions): Promise<T> {
  const result = await request<T>('GET', path, init);
  if (!result.ok) error(result.status === 404 ? 404 : result.status, result.message);
  return result.data;
}

export function sendPost<T>(path: string, init: SendOptions): Promise<ApiResult<T>> {
  return request<T>('POST', path, init);
}

export function sendPatch<T>(path: string, init: SendOptions): Promise<ApiResult<T>> {
  return request<T>('PATCH', path, init);
}

export function sendDelete<T>(path: string, init: SendOptions): Promise<ApiResult<T>> {
  return request<T>('DELETE', path, init);
}

function encodeBody(body: SendOptions['body']): { headers: Headers; payload?: BodyInit } {
  if (body === null) return { headers: new Headers() };
  if (typeof FormData !== 'undefined' && body instanceof FormData) return { headers: new Headers(), payload: body };
  const headers = new Headers();
  headers.set('content-type', 'application/json');
  return { headers, payload: JSON.stringify(body) };
}

async function request<T>(method: string, path: string, init: SendOptions): Promise<ApiResult<T>> {
  const { headers, payload } = encodeBody(init.body);
  const query = init.queryParams ? queryString(init.queryParams) : '';
  let res: Response;
  try {
    res = await fetch(`${origin()}${path}${query}`, { method, headers, body: payload });
  } catch {
    error(503, 'API is unavailable.');
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T & { message?: string; error?: string }) : ({} as T);
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && data.message) ||
      (data && typeof data === 'object' && 'error' in data && data.error) ||
      'Request failed.';
    return {
      ok: false,
      status: res.status,
      message: String(message),
      body: (data && typeof data === 'object' ? data : {}) as Record<string, unknown>,
    };
  }
  return { ok: true, status: res.status, data: data as T };
}
