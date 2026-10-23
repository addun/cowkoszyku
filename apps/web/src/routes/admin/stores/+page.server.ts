import { apiGet } from '$lib/admin/client';
import type { AdminStoresResponse } from '@cowkoszyku/contract/admin/locations';

const LIMIT = 40;

export const load = async ({ url }) => {
  const params = new URLSearchParams({ offset: '0', limit: String(LIMIT) });
  const body = await apiGet<AdminStoresResponse>(`/api/admin/stores?${params}`);
  return { stores: body.stores, error: url.searchParams.get('error') ?? '' };
};
