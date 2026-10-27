import { queryParams, queryValue } from '$lib/common/http';
import { listReceipts } from '$lib/api/admin/receipts';

const LIMIT = 40;

export const load = async ({ url }) => {
  const query = queryParams(url);
  const store = queryValue(query, 'store');
  const body = await listReceipts({ store, offset: 0, limit: LIMIT });
  return { ...body, error: queryValue(query, 'error') };
};
