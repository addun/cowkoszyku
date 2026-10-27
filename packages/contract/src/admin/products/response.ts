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

export const AdminProductDuplicateItemResponse = z.object({
  id: z.number().int(),
  name: z.string(),
  unitName: z.string(),
  image: z.string(),
});

export const AdminProductDuplicatesResponse = z.object({
  groups: z.array(
    z.object({
      ean: z.string(),
      count: z.number().int(),
      products: z.array(AdminProductDuplicateItemResponse),
    }),
  ),
});
export type AdminProductDuplicatesResponse = z.infer<typeof AdminProductDuplicatesResponse>;

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
