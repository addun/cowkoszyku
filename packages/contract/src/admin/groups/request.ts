import { z } from 'zod';

export const ComparisonGroupId = z.coerce.number().int().positive();
export const ProductId = z.coerce.number().int().positive();

export const ComparisonGroupRequest = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  unit_id: z.number().int().positive('Choose a comparison unit.'),
  product_id: z.array(z.number().int().positive()).optional(),
});
export type ComparisonGroupRequest = z.input<typeof ComparisonGroupRequest>;

export const ComparisonGroupProductsRequest = z.object({
  product_id: z.array(z.number().int().positive()).min(1, 'Choose a product.'),
});
export type ComparisonGroupProductsRequest = z.input<typeof ComparisonGroupProductsRequest>;
