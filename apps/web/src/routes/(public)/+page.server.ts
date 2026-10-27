import { isHttpError } from '@sveltejs/kit';
import { lookupProducts } from '$lib/api/public/lookup';

async function lookup(q: string, failure: string) {
  try {
    const body = await lookupProducts(q);
    return { products: body.products, error: '' };
  } catch (err) {
    const unavailable = !isHttpError(err) || err.status === 503;
    return { products: [], error: unavailable ? 'API jest niedostępne.' : failure };
  }
}

export const load = async ({ url }: { url: URL }) => {
  const query = (url.searchParams.get('q') ?? '').trim();
  const [popular, found] = await Promise.all([
    lookup('', 'API jest niedostępne.'),
    query ? lookup(query, 'Nie udało się wyszukać produktów.') : null,
  ]);
  return {
    query,
    popular: popular.products,
    error: popular.error,
    products: found?.products ?? [],
    searchError: found?.error ?? '',
  };
};
