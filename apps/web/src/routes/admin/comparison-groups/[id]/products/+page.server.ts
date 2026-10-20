import { redirect } from '@sveltejs/kit';
import { apiGet, apiSend, formInts, formJson, rejected } from '$lib/admin/client';
import type { AdminProductsResponse } from '../../../../../../../api/src/features/admin/products/contract/response';

const LIMIT = 40;

export const load = async ({ params, url }) => {
  const q = url.searchParams.get('q') ?? '';
  const search = new URLSearchParams({ q, offset: '0', limit: String(LIMIT) });
  const [body, catalog] = await Promise.all([
    apiGet<{
      group: { id: number; name: string; unitName: string };
      products: { id: number; name: string; unitName: string }[];
    }>(`/api/admin/comparison-groups/${params.id}`),
    apiGet<AdminProductsResponse>(`/api/admin/products.json?${search}`),
  ]);
  return {
    group: body.group,
    members: body.products,
    products: catalog.products,
    currency: catalog.currency,
    q,
  };
};

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const ids = formInts(form, 'product_id');
    if (ids.length === 0) return rejected(400, 'Choose a product.');
    const result = await apiSend('POST', `/api/admin/comparison-groups/${params.id}/products`, {
      json: { product_id: ids },
    });
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/comparison-groups/${params.id}/edit`);
  },
};
