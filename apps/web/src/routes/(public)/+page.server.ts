import { apiSend } from '$lib/admin/client';

type Lookup = {
  products: {
    id: number;
    name: string;
    image: string;
    tint: string;
    initial: string;
    now: string;
    extras: { price: string; unitName: string }[];
    priceNote: string;
  }[];
};

export const load = async () => {
  try {
    const result = await apiSend<Lookup>('GET', '/api/lookup.json');
    if (!result.ok) return { products: [], error: 'API jest niedostępne.' };
    return { products: result.data.products, error: '' };
  } catch {
    return { products: [], error: 'API jest niedostępne.' };
  }
};
