import { z } from 'zod';

/** OCR till names gain or lose spaces; aliases are stored without whitespace. */
export function stripAliasWhitespace(alias: string): string {
  return alias.replace(/\s+/gu, '');
}

export const AliasId = z.coerce.number().int().positive();

export const ProductRefRequest = z.object({
  product: z.coerce.number().int().nonnegative().default(0),
  error: z.string().trim().default(''),
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
