import { apiGet } from '$lib/admin/client';
import type { AdminReceiptsResponse } from '@cowkoszyku/contract/admin/receipts';

export const load = async ({ url }) => {
  const store = url.searchParams.get('store') ?? '';
  const params = new URLSearchParams();
  if (store) params.set('store', store);
  const query = params.size > 0 ? `?${params}` : '';
  const body = await apiGet<AdminReceiptsResponse>(`/api/admin/receipts${query}`);
  return { ...body, error: url.searchParams.get('error') ?? '' };
};
