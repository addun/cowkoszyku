import { apiGet } from '$lib/admin/client';
import type { AdminAliasesResponse } from '@cowkoszyku/contract/admin/aliases';

const LIMIT = 40;

export const load = async ({ url }) => {
  const product = url.searchParams.get('product') ?? '';
  const q = url.searchParams.get('q') ?? '';
  const params = new URLSearchParams({ offset: '0', limit: String(LIMIT) });
  if (product) params.set('product', product);
  if (q) params.set('q', q);
  const body = await apiGet<AdminAliasesResponse>(`/api/admin/aliases?${params}`);
  return { ...body, error: url.searchParams.get('error') ?? '' };
};
