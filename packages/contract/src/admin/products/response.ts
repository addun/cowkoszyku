import { z } from 'zod';
import { decimalString } from '../../decimal-string.js';

export const AdminProductResponse = z.object({
  id: z.number().int(),
  name: z.string(),
  unitName: z.string(),
  image: z.string(),
  compareValue: decimalString,
  lastBought: z.string(),
  price: z.string(),
  priceNote: z.string(),
});
export type AdminProductResponse = z.infer<typeof AdminProductResponse>;

export const AdminProductsResponse = z.object({
  query: z.string(),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  currency: z.string(),
  unit: z.number().int().nonnegative().default(0),
  unitName: z.string().default(''),
  products: z.array(AdminProductResponse),
});
export type AdminProductsResponse = z.infer<typeof AdminProductsResponse>;
