import { sendGet, pathId } from '$lib/common/http';

export type LookupProduct = {
  id: number;
  name: string;
  image: string;
  tint: string;
  initial: string;
  now: string;
  extras: { price: string; unitName: string }[];
  priceNote: string;
};

export type LookupProductPage = {
  id: number;
  name: string;
  image: string;
  initial: string;
  priceEyebrow: string;
  priceNote: string;
  now: string;
  extras: { price: string; unitName: string }[];
  stats: { label: string; value: string }[];
  chart: { points: { on: string; price: string }[]; from: string; to: string; symbol: string } | null;
  related: LookupProduct[];
};

export function lookupProducts(q = ''): Promise<{ products: LookupProduct[] }> {
  return sendGet('/api/lookup.json', { queryParams: { q }, body: null });
}

export function lookupProduct(id: string): Promise<LookupProductPage> {
  return sendGet(`/api/lookup/${pathId(id)}`, { queryParams: null, body: null });
}
