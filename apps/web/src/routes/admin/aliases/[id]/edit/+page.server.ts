import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { getAlias, updateAlias } from '$lib/api/admin/aliases';

export const load = async ({ params }) => getAlias(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await updateAlias(params.id, {
      product_id: formInt(form, 'product_id'),
      scope: formText(form, 'scope'),
      alias: formText(form, 'alias'),
    });
    if (!result.ok) {
      return rejected(result.status, result.message, {
        alias: { id: Number(params.id), productId: form.product_id, alias: form.alias, scopeValue: form.scope },
        fromProduct: form.from_product,
      });
    }
    const from = Number(form.from_product) || 0;
    redirect(303, from > 0 ? `/admin/aliases?product=${from}` : '/admin/aliases');
  },
};
