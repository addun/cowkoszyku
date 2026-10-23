import type { AdminProductResponse, AdminProductsResponse } from '@cowkoszyku/contract/admin/products';

const LIMIT = 40;

export const load = async ({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) => {
  const q = url.searchParams.get('q') ?? '';
  const unit = url.searchParams.get('unit') ?? '';
  const params = new URLSearchParams({ q, offset: '0', limit: String(LIMIT) });
  if (unit) params.set('unit', unit);
  const devServer = import.meta.env.DEV && typeof window === 'undefined';
  const endpoint = `${devServer ? 'http://127.0.0.1:8080' : ''}/api/admin/products.json?${params}`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      return { products: [] as AdminProductResponse[], currency: '', unitName: '', loadError: 'Could not load products.' };
    }
    const body = (await res.json()) as AdminProductsResponse;
    return { products: body.products, currency: body.currency, unitName: body.unitName, loadError: '' };
  } catch {
    return { products: [] as AdminProductResponse[], currency: '', unitName: '', loadError: 'API is unavailable.' };
  }
};
