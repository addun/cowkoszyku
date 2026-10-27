import { apiGet } from '$lib/admin/client';
import type { AdminReceiptsResponse } from '@cowkoszyku/contract/admin/receipts';

const LIMIT = 40;

export const load = async ({ url }) => {
  const store = url.searchParams.get('store') ?? '';
  const params = new URLSearchParams({ offset: '0', limit: String(LIMIT) });
  if (store) params.set('store', store);
  const body = await apiGet<AdminReceiptsResponse>(`/api/admin/receipts?${params}`);
  return { ...body, error: url.searchParams.get('error') ?? '' };
};
