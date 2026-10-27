import { z } from 'zod';

export const BiedronkaShopsImportRequest = z.object({
  retail_chain_id: z.number().int().positive('Choose a retail chain.'),
});
export type BiedronkaShopsImportRequest = z.input<typeof BiedronkaShopsImportRequest>;
