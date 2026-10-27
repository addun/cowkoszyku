import { z } from 'zod';

export const UnitId = z.coerce.number().int().positive();

export const UnitRequest = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  compare_value: z.string().trim(),
});
export type UnitRequest = z.input<typeof UnitRequest>;
