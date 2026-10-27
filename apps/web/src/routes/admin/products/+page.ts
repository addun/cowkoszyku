import { isHttpError } from '@sveltejs/kit';
import { queryParams, queryValue } from '$lib/common/http';
import { listProducts } from '$lib/api/admin/products';
import type { AdminProductResponse } from '@cowkoszyku/contract/admin/products';

const LIMIT = 40;

export const load = async ({ url }) => {
  const query = queryParams(url);
  const q = queryValue(query, 'q');
  const unit = queryValue(query, 'unit');
  try {
    const body = await listProducts({ q, offset: 0, limit: LIMIT, unit });
    return { products: body.products, currency: body.currency, unitName: body.unitName, loadError: '' };
  } catch (err) {
    const loadError = isHttpError(err) && err.status !== 503 ? 'Could not load products.' : 'API is unavailable.';
    return { products: [] as AdminProductResponse[], currency: '', unitName: '', loadError };
  }
};
