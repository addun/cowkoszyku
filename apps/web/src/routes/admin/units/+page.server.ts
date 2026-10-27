import { queryParams, queryValue } from '$lib/common/http';
import { listUnits } from '$lib/api/admin/units';

export const load = async ({ url }) => {
  const body = await listUnits();
  return { units: body.units, error: queryValue(queryParams(url), 'error') };
};
