import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteProduct, getProduct } from '$lib/api/admin/products';

export const load = async ({ params }) => {
  const body = await getProduct(params.id);
  return { product: body.product };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteProduct(params.id);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, '/admin/products');
  },
};
