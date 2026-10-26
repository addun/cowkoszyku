import { Injectable } from '@nestjs/common';
import type { z } from 'zod';
import { InvalidRetailChainError, InvalidStoreError } from '../../../domain/errors.js';
import { AliasesRepository, type ProductAlias } from '#app/store/aliases';
import { LocationsRepository } from '#app/store/locations';
import { ProductsRepository, type Product } from '#app/store/products';
import { presentAlias, presentChain } from '../../../web/present.js';
import {
  type AliasRequest,
  AliasesListRequest,
} from '@cowkoszyku/contract/admin/aliases';

@Injectable()
export class AdminAliasesHandler {
  constructor(
    private readonly aliases: AliasesRepository,
    private readonly products: ProductsRepository,
    private readonly locations: LocationsRepository,
  ) {}

  list(query: z.infer<typeof AliasesListRequest>) {
    const filter = query.product > 0 ? this.products.getProduct(query.product) : null;
    const rows = this.aliases.listAliasesPage({
      productId: filter?.id ?? 0,
      q: query.q,
      offset: query.offset,
      limit: query.limit,
    });
    return {
      aliases: rows.map(presentAlias),
      filter,
      productQuery: filter ? `?product=${filter.id}` : '',
      query: query.q,
      offset: query.offset,
      limit: query.limit,
    };
  }

  blank(query: { product: number }) {
    const lookups = this.lookups();
    const alias = emptyAlias();
    let locked: Product | null = null;
    if (query.product > 0) {
      locked = this.products.getProduct(query.product);
      alias.productId = locked.id;
    }
    return {
      ...lookups,
      alias: presentAlias(alias),
      lockedProduct: locked,
      fromProduct: query.product,
    };
  }

  get(aliasId: number) {
    return {
      ...this.lookups(),
      alias: presentAlias(this.aliases.getAlias(aliasId)),
      lockedProduct: null,
      fromProduct: 0,
    };
  }

  create(body: z.infer<typeof AliasRequest>) {
    const { storeID, chainID } = parseAliasScope(body.scope);
    return presentAlias(this.aliases.createAlias(body.product_id, storeID || null, chainID || null, body.alias));
  }

  update(aliasId: number, body: z.infer<typeof AliasRequest>) {
    this.aliases.getAlias(aliasId);
    const { storeID, chainID } = parseAliasScope(body.scope);
    this.aliases.updateAlias(aliasId, body.product_id, storeID || null, chainID || null, body.alias);
    return presentAlias(this.aliases.getAlias(aliasId));
  }

  remove(aliasId: number) {
    const alias = this.aliases.getAlias(aliasId);
    this.aliases.deleteAlias(aliasId);
    return { ok: true, alias: alias.alias };
  }

  private lookups() {
    return {
      products: [],
      stores: [],
      chains: this.locations.listRetailChains().map(presentChain),
    };
  }
}

function parseAliasScope(raw: string): { storeID: number; chainID: number } {
  raw = raw.trim();
  if (raw === '') return { storeID: 0, chainID: 0 };
  const i = raw.indexOf(':');
  if (i < 0) throw new InvalidStoreError();
  const kind = raw.slice(0, i);
  const n = Number.parseInt(raw.slice(i + 1), 10);
  if (!Number.isFinite(n) || n <= 0) {
    if (kind === 'chain') throw new InvalidRetailChainError();
    throw new InvalidStoreError();
  }
  if (kind === 'store') return { storeID: n, chainID: 0 };
  if (kind === 'chain') return { storeID: 0, chainID: n };
  throw new InvalidStoreError();
}

function emptyAlias(): ProductAlias {
  return {
    id: 0,
    productId: 0,
    productName: '',
    storeId: null,
    storeName: '',
    retailChainId: null,
    retailChainName: '',
    alias: '',
  };
}
