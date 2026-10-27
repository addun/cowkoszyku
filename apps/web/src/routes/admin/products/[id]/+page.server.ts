import { queryParams, queryValue } from '$lib/common/http';
import { getProduct } from '$lib/api/admin/products';

export const load = async ({ params, url }) => {
  const body = await getProduct(params.id);
  return { ...body, error: queryValue(queryParams(url), 'error') };
};
