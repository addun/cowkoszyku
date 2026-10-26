import { apiGet } from '$lib/admin/client';
import type { AdminProductsResponse } from '@cowkoszyku/contract/admin/products';

const LIMIT = 40;

export const load = async ({ params }) => {
  const search = new URLSearchParams({ offset: '0', limit: String(LIMIT) });
  const [body, catalog] = await Promise.all([
    apiGet<{
      group: { id: number; name: string; unitName: string };
      products: { id: number; name: string; image: string; now: string; priceNote: string }[];
    }>(`/api/admin/comparison-groups/${params.id}`),
    apiGet<AdminProductsResponse>(`/api/admin/products.json?${search}`),
  ]);
  return {
    group: body.group,
    members: body.products,
    products: catalog.products,
    currency: catalog.currency,
  };
};
