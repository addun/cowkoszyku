import { Decimal } from 'decimal.js';
import type { QuotedPrice } from '../../domain/price-stats.js';

export type ProductConversion = {
  unitId: number;
  unitName: string;
  compareValue: Decimal;
  factor: Decimal;
};

export type Product = {
  id: number;
  name: string;
  ean: string;
  unitId: number;
  unitName: string;
  compareValue: Decimal;
  imagePath: string | null;
  createdAt: string;
  conversions: ProductConversion[];
};

export type ProductListItem = Product & {
  lastBought: string | null;
  lifetimeAmount: Decimal;
  purchaseCount: number;
  quote: QuotedPrice | null;
};

export type ProductQuote = {
  product: Product;
  quote: QuotedPrice | null;
};

export type MergePlan = {
  into: Product;
  from: Product;
  history: number;
  aliases: number;
  nameAsAlias: string;
  takePhoto: boolean;
};

export type ProductEanRow = {
  id: number;
  name: string;
  ean: string;
  unitName: string;
  imagePath: string | null;
};

export type ProductDuplicateGroup = {
  ean: string;
  products: ProductEanRow[];
};

/** Products that share one EAN. Empty codes are not a match. Later checks can sit beside this. */
export function duplicateProductGroups(rows: ProductEanRow[]): ProductDuplicateGroup[] {
  const groups = new Map<string, ProductDuplicateGroup>();
  for (const row of rows) {
    const ean = row.ean.replace(/\s+/g, '');
    if (ean === '') continue;
    const product: ProductEanRow = {
      id: row.id,
      name: row.name,
      ean,
      unitName: row.unitName,
      imagePath: row.imagePath,
    };
    const existing = groups.get(ean);
    if (existing) existing.products.push(product);
    else groups.set(ean, { ean, products: [product] });
  }
  return [...groups.values()]
    .filter((group) => group.products.length >= 2)
    .map((group) => ({
      ...group,
      products: [...group.products].sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id),
    }))
    .sort((a, b) => b.products.length - a.products.length || a.ean.localeCompare(b.ean));
}

export function conversionFor(p: Product, unitId: number): ProductConversion | null {
  return p.conversions.find((c) => c.unitId === unitId) ?? null;
}

export function unitIdsAttr(p: Product): string {
  return [p.unitId, ...p.conversions.map((c) => c.unitId)].join(',');
}

export function packConversionsJSON(p: Product): string {
  return JSON.stringify(
    p.conversions.map((c) => ({ name: c.unitName, factor: c.factor.toString() })),
  );
}
