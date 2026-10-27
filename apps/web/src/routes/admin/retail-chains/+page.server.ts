import { queryParams, queryValue } from '$lib/common/http';
import { listRetailChains } from '$lib/api/admin/retail-chains';

export const load = async ({ url }) => {
  const body = await listRetailChains();
  return { retailChains: body.retailChains, error: queryValue(queryParams(url), 'error') };
};
