import { getComparisonGroup } from '$lib/api/admin/groups';
import { listProducts } from '$lib/api/admin/products';

const LIMIT = 40;

export const load = async ({ params }) => {
  const [body, catalog] = await Promise.all([
    getComparisonGroup(params.id),
    listProducts({ offset: 0, limit: LIMIT }),
  ]);
  return {
    group: body.group,
    members: body.products,
    products: catalog.products,
    currency: catalog.currency,
  };
};
