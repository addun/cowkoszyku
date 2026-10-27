import { ConflictException, Injectable } from '@nestjs/common';
import type { z } from 'zod';
import { LocationsRepository, type Store } from '#app/store/locations';
import { presentChain, presentStore } from '../../../web/present.js';
import {
  type NewStoreRequest,
  RetailChainRequest,
  StoresListRequest,
  StoreMergeRequest,
  StoreRequest,
} from '@cowkoszyku/contract/admin/locations';

@Injectable()
export class AdminLocationsHandler {
  constructor(private readonly locations: LocationsRepository) {}

  chains() {
    return { retailChains: this.locations.listRetailChains().map(presentChain) };
  }

  chain(chainId: number) {
    return presentChain(this.locations.getRetailChain(chainId));
  }

  createChain(body: z.infer<typeof RetailChainRequest>) {
    return presentChain(this.locations.createRetailChain(body.name, body.legal_name, body.tax_id));
  }

  updateChain(chainId: number, body: z.infer<typeof RetailChainRequest>) {
    this.locations.updateRetailChain(chainId, body.name, body.legal_name, body.tax_id);
    return presentChain(this.locations.getRetailChain(chainId));
  }

  removeChain(chainId: number) {
    const chain = this.locations.getRetailChain(chainId);
    if (chain.storeCount > 0) throw new ConflictException(`Cannot delete “${chain.name}” while a store still uses it.`);
    this.locations.deleteRetailChain(chainId);
    return { ok: true };
  }

  stores(query: z.infer<typeof StoresListRequest>) {
    return {
      stores: this.locations.listStoresPage(query.offset, query.limit, query.q).map(presentStore),
      offset: query.offset,
      limit: query.limit,
    };
  }

  newStore(query: z.infer<typeof NewStoreRequest>) {
    const store = emptyStore();
    store.name = query.name;
    store.streetName = query.street_name;
    store.buildingNumber = query.building_number;
    store.apartmentNumber = query.apartment_number;
    store.postalCode = query.postal_code;
    store.city = query.city;
    store.externalId = query.external_id;
    return {
      store: presentStore(store),
      retailChains: this.locations.listRetailChains().map(presentChain),
      next: receiptReturnPath(query.next),
    };
  }

  store(storeId: number) {
    return {
      store: presentStore(this.locations.getStore(storeId)),
      retailChains: this.locations.listRetailChains().map(presentChain),
    };
  }

  createStore(body: z.infer<typeof StoreRequest>) {
    const created = this.locations.createStore(
      body.name,
      body.street_name,
      body.building_number,
      body.apartment_number,
      body.postal_code,
      body.city,
      body.external_id,
      body.retail_chain_id,
      body.lat,
      body.lng,
    );
    return { ...presentStore(created), next: receiptReturnPath(body.next) };
  }

  updateStore(storeId: number, body: z.infer<typeof StoreRequest>) {
    this.locations.updateStore(
      storeId,
      body.name,
      body.street_name,
      body.building_number,
      body.apartment_number,
      body.postal_code,
      body.city,
      body.external_id,
      body.retail_chain_id,
      body.lat,
      body.lng,
    );
    return presentStore(this.locations.getStore(storeId));
  }

  removeStore(storeId: number) {
    const store = this.locations.getStore(storeId);
    if (store.purchaseCount > 0) throw new ConflictException(`Cannot delete “${store.name}” while a purchase still uses it.`);
    this.locations.deleteStore(storeId);
    return { ok: true };
  }

  mergeOptions(storeId: number) {
    const store = this.locations.getStore(storeId);
    return {
      store: presentStore(store),
      targets: [],
    };
  }

  mergePlan(storeId: number, intoId: number) {
    const plan = this.locations.mergePlan(intoId, storeId);
    return {
      plan: { ...plan, into: presentStore(plan.into), from: presentStore(plan.from) },
    };
  }

  merge(storeId: number, body: z.infer<typeof StoreMergeRequest>) {
    this.locations.mergeStores(body.into_id, storeId);
    return { id: body.into_id };
  }
}

function emptyStore(): Store {
  return {
    id: 0,
    name: '',
    streetName: '',
    buildingNumber: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
    externalId: '',
    lat: null,
    lng: null,
    retailChainId: null,
    retailChainName: '',
    purchaseCount: 0,
  };
}

function receiptReturnPath(s: string): string {
  s = s.trim();
  if (s === '') return '';
  try {
    const url = new URL(s, 'http://local');
    if (url.host !== 'local' || url.search || url.hash) return '';
    const path = url.pathname;
    if (!path.startsWith('/admin/receipts/')) return '';
    const receiptId = path.slice('/admin/receipts/'.length);
    if (receiptId === '' || /[/.]/.test(receiptId) || !/^\d+$/.test(receiptId)) return '';
    return '/admin/receipts/' + receiptId;
  } catch {
    return '';
  }
}
