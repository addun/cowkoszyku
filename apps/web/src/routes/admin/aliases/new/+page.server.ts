import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { queryParams, queryValue } from '$lib/common/http';
import { createAlias, getNewAlias } from '$lib/api/admin/aliases';

export const load = async ({ url }) => {
  const query = queryParams(url);
  return getNewAlias({ product: queryValue(query, 'product'), error: queryValue(query, 'error') });
};

export const actions = {
  default: async ({ request, url }) => {
    const form = formJson(await request.formData());
    const result = await createAlias({
      product_id: formInt(form, 'product_id'),
      scope: formText(form, 'scope'),
      alias: formText(form, 'alias'),
    });
    if (!result.ok) return rejected(result.status, result.message, aliasDraft(form));
    const from = Number(form.from_product) || Number(queryValue(queryParams(url), 'product')) || 0;
    redirect(303, from > 0 ? `/admin/aliases?product=${from}` : '/admin/aliases');
  },
};

function aliasDraft(json: Record<string, unknown>) {
  return {
    alias: { productId: json.product_id, alias: json.alias, scopeValue: json.scope },
    fromProduct: json.from_product,
  };
}
