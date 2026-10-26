import { z } from 'zod';
import { decimalString } from '../../decimal-string.js';

export const AdminComparisonGroupResponse = z.object({
  id: z.number().int(),
  name: z.string(),
  unitId: z.number().int(),
  unitName: z.string(),
  createdAt: z.string(),
  productCount: z.number().int(),
});
export type AdminComparisonGroupResponse = z.infer<typeof AdminComparisonGroupResponse>;

export const AdminComparisonGroupsResponse = z.object({
  groups: z.array(AdminComparisonGroupResponse),
});
export type AdminComparisonGroupsResponse = z.infer<typeof AdminComparisonGroupsResponse>;

export const AdminComparisonGroupFormResponse = z.object({
  group: AdminComparisonGroupResponse,
  units: z.array(z.object({ id: z.number().int(), name: z.string(), compareValue: decimalString })),
  products: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      unitName: z.string(),
      image: z.string(),
      now: z.string(),
      priceNote: z.string(),
    }),
  ),
});
export type AdminComparisonGroupFormResponse = z.infer<typeof AdminComparisonGroupFormResponse>;

export const AdminComparisonGroupDeletedResponse = z.object({
  ok: z.literal(true),
  name: z.string(),
});
export type AdminComparisonGroupDeletedResponse = z.infer<typeof AdminComparisonGroupDeletedResponse>;
