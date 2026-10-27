import { formJson, rejected } from '$lib/admin/client';
import { getProductMerge } from '$lib/api/admin/products';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => getProductMerge(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const json = formJson(await request.formData());
    const into = Number(json.into_id) || 0;
    if (!into) return rejected(422, 'Choose a product.', { intoId: 0 });
    redirect(303, `/admin/products/${params.id}/merge-with/${into}`);
  },
};
