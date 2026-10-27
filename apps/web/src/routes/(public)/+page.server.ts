import { lookupProducts } from '$lib/api/public/lookup';

export const load = async () => {
  try {
    const body = await lookupProducts();
    return { products: body.products, error: '' };
  } catch {
    return { products: [], error: 'API jest niedostępne.' };
  }
};
