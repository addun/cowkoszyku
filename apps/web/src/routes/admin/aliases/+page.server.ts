import { queryParams, queryValue } from '$lib/common/http';
import { listAliases } from '$lib/api/admin/aliases';

const LIMIT = 40;

export const load = async ({ url }) => {
  const query = queryParams(url);
  const product = queryValue(query, 'product');
  const q = queryValue(query, 'q');
  const body = await listAliases({ product, q, offset: 0, limit: LIMIT });
  return { ...body, error: queryValue(query, 'error') };
};
