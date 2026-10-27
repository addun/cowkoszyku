import { fail } from '@sveltejs/kit';

export function multipart(form: FormData): FormData {
  const out = new FormData();
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      if (value.size > 0) out.append(key, value, value.name);
    } else out.append(key, value);
  }
  return out;
}

export function formJson(form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (value instanceof File) continue;
    const current = out[key];
    if (current === undefined) out[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else out[key] = [current, value];
  }
  return out;
}

export function formText(form: Record<string, unknown>, key: string): string {
  const value = form[key];
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

export function formInt(form: Record<string, unknown>, key: string): number {
  const value = form[key];
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export function formInts(form: Record<string, unknown>, key: string): number[] {
  const value = form[key];
  const items = Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
  return items.map((item) => Number.parseInt(String(item), 10)).filter((n) => Number.isFinite(n) && n > 0);
}

export function formCoord(form: Record<string, unknown>, key: string): number | string | null {
  const raw = formText(form, key).trim().replace(',', '.');
  if (raw === '') return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : raw;
}

export function rejected(status: number, message: string, extra: Record<string, unknown> = {}) {
  return fail(status, { message, ...extra });
}
