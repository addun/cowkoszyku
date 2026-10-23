import { z } from 'zod';

/** OCR till names gain or lose spaces; aliases are stored without whitespace. */
export function stripAliasWhitespace(alias: string): string {
  return alias.replace(/\s+/gu, '');
}

export const AliasId = z.coerce.number().int().positive();

const ALIAS_PAGE_SIZE = 40;
const ALIAS_PAGE_MAX = 100;

export const ProductRefRequest = z.object({
  product: z.coerce.number().int().nonnegative().default(0),
  error: z.string().trim().default(''),
});

export const AliasesListRequest = z.object({
  product: z.coerce.number().int().nonnegative().default(0),
  q: z.string().trim().default(''),
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(ALIAS_PAGE_MAX).default(ALIAS_PAGE_SIZE),
});

export const AliasRequest = z.object({
  product_id: z.number().int().positive('Choose a product.'),
  scope: z.string().trim(),
  alias: z
    .string()
    .trim()
    .min(1, 'Alias is required.')
    .transform(stripAliasWhitespace)
    .pipe(z.string().min(1, 'Alias is required.')),
});
