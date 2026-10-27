import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { queryParams, queryValue } from '$lib/common/http';
import { deleteAlias, getAlias } from '$lib/api/admin/aliases';

export const load = async ({ params, url }) => {
  const body = await getAlias(params.id);
  return { alias: body.alias, product: queryValue(queryParams(url), 'product') };
};

export const actions = {
  default: async ({ params, url }) => {
    const result = await deleteAlias(params.id);
    if (!result.ok) return rejected(result.status, result.message);
    const product = queryValue(queryParams(url), 'product');
    redirect(303, product ? `/admin/aliases?product=${encodeURIComponent(product)}` : '/admin/aliases');
  },
};
