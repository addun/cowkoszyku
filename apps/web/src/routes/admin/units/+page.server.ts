import { apiGet } from '$lib/admin/client';

export const load = async ({ url }) => {
  const body = await apiGet<{ units: unknown[] }>('/api/admin/units');
  return { units: body.units, error: url.searchParams.get('error') ?? '' };
};
