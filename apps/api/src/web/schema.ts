import { z } from 'zod';
import { biedronkaImportReceipt } from '../imports/biedronka.schema.js';

/** One HTML/query field: missing, scalar, or first of a repeated field, then trimmed. */
const field = z.preprocess((v) => {
  if (v == null) return '';
  if (Array.isArray(v)) return v[0] == null ? '' : String(v[0]);
  return String(v);
}, z.string().trim());

/** Positive integer from a route param. Invalid values fail the pipe. */
export const id = z.coerce.number().int().positive();

export const qQuery = z.object({ q: field });

export const biedronkaTxId = z
  .string()
  .trim()
  .min(1, 'invalid id')
  .max(128, 'invalid id')
  .regex(/^[\p{L}\p{N}_-]+$/u, 'invalid id');

export const biedronkaImportBody = z.object({
  id: field.pipe(biedronkaTxId),
  date: field,
  store_name: field,
  receipt_num: field,
  total_price: z.coerce.number().catch(0),
  receipt: z.preprocess((v) => {
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (s === '') return v;
    try {
      return JSON.parse(s);
    } catch {
      return v;
    }
  }, biedronkaImportReceipt),
});

export type QQuery = z.infer<typeof qQuery>;
