import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { getProductMergePlan, mergeProduct } from '$lib/api/admin/products';

export const load = async ({ params }) => getProductMergePlan(params.id, params.into);

export const actions = {
  default: async ({ params }) => {
    const result = await mergeProduct(params.id, { into_id: Number(params.into) });
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/products/${result.data.id}`);
  },
};
