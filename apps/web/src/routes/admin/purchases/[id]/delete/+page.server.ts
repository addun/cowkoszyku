import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deletePurchase, getPurchase } from '$lib/api/admin/purchases';

export const load = async ({ params }) => getPurchase(params.id);

export const actions = {
  default: async ({ params }) => {
    const result = await deletePurchase(params.id);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/products/${result.data.productId}`);
  },
};
