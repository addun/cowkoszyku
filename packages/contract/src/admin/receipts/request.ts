import { z } from 'zod';

const RECEIPT_PAGE_SIZE = 40;
const RECEIPT_PAGE_MAX = 100;

const optionalStoreId = z.preprocess((value) => {
  if (value == null || value === '') return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const ReceiptId = z.coerce.number().int().positive();

export const ReceiptsListRequest = z.object({
  store: optionalStoreId,
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(RECEIPT_PAGE_MAX).default(RECEIPT_PAGE_SIZE),
});

export const ReceiptVisitRequest = z.object({
  bought_on: z.string().trim(),
  store_id: z.number().int(),
});

export const ReceiptFormRequest = z.record(z.string(), z.string());
