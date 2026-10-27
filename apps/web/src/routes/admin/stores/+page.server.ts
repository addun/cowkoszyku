import { queryParams, queryValue } from '$lib/common/http';
import { listStores } from '$lib/api/admin/stores';

const LIMIT = 40;

export const load = async ({ url }) => {
  const body = await listStores({ offset: 0, limit: LIMIT });
  return { stores: body.stores, error: queryValue(queryParams(url), 'error') };
};
