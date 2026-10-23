import { z } from 'zod';

const optionalStoreId = z.preprocess((value) => {
  if (value == null || value === '') return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

export const ReceiptId = z.coerce.number().int().positive();

export const ReceiptsListRequest = z.object({
  store: optionalStoreId,
});

export const ReceiptVisitRequest = z.object({
  bought_on: z.string().trim(),
  store_id: z.number().int(),
});

export const ReceiptFormRequest = z.record(z.string(), z.string());
