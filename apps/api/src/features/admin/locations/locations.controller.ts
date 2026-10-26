import { Body, Controller, Delete, Get, Param, Patch, Post, Query, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import {
  RetailChainId,
  StoreId,
  NewStoreRequest,
  RetailChainRequest,
  StoresListRequest,
  StoreMergeRequest,
  StoreRequest,
  AdminChainResponse,
  AdminChainsResponse,
  AdminCreatedStoreResponse,
  AdminNewStoreResponse,
  AdminOkResponse,
  AdminStoreFormResponse,
  AdminStoreMergeOptionsResponse,
  AdminStoreMergePlanResponse,
  AdminStoreMergedResponse,
  AdminStoreResponse,
  AdminStoresResponse,
} from '@cowkoszyku/contract/admin/locations';
import { AdminLocationsHandler } from './locations.handler.js';

@Controller()
export class AdminLocationsController {
  constructor(private readonly handler: AdminLocationsHandler) {}

  @Get('/api/admin/retail-chains')
  @SerializeOptions({ schema: AdminChainsResponse })
  chains() {
    return this.handler.chains();
  }

  @Get('/api/admin/retail-chains/:id')
  @SerializeOptions({ schema: AdminChainResponse })
  chain(@Param('id', { schema: RetailChainId }) chainId: number) {
    return this.handler.chain(chainId);
  }

  @Post('/api/admin/retail-chains')
  @SerializeOptions({ schema: AdminChainResponse })
  createChain(@Body({ schema: RetailChainRequest }) body: z.infer<typeof RetailChainRequest>) {
    return this.handler.createChain(body);
  }

  @Patch('/api/admin/retail-chains/:id')
  @SerializeOptions({ schema: AdminChainResponse })
  updateChain(
    @Param('id', { schema: RetailChainId }) chainId: number,
    @Body({ schema: RetailChainRequest }) body: z.infer<typeof RetailChainRequest>,
  ) {
    return this.handler.updateChain(chainId, body);
  }

  @Delete('/api/admin/retail-chains/:id')
  @SerializeOptions({ schema: AdminOkResponse })
  removeChain(@Param('id', { schema: RetailChainId }) chainId: number) {
    return this.handler.removeChain(chainId);
  }

  @Get('/api/admin/stores')
  @SerializeOptions({ schema: AdminStoresResponse })
  stores(@Query({ schema: StoresListRequest }) query: z.infer<typeof StoresListRequest>) {
    return this.handler.stores(query);
  }

  @Get('/api/admin/stores/new')
  @SerializeOptions({ schema: AdminNewStoreResponse })
  newStore(@Query({ schema: NewStoreRequest }) query: z.infer<typeof NewStoreRequest>) {
    return this.handler.newStore(query);
  }

  @Get('/api/admin/stores/:id')
  @SerializeOptions({ schema: AdminStoreFormResponse })
  store(@Param('id', { schema: StoreId }) storeId: number) {
    return this.handler.store(storeId);
  }

  @Post('/api/admin/stores')
  @SerializeOptions({ schema: AdminCreatedStoreResponse })
  createStore(@Body({ schema: StoreRequest }) body: z.infer<typeof StoreRequest>) {
    return this.handler.createStore(body);
  }

  @Patch('/api/admin/stores/:id')
  @SerializeOptions({ schema: AdminStoreResponse })
  updateStore(
    @Param('id', { schema: StoreId }) storeId: number,
    @Body({ schema: StoreRequest }) body: z.infer<typeof StoreRequest>,
  ) {
    return this.handler.updateStore(storeId, body);
  }

  @Delete('/api/admin/stores/:id')
  @SerializeOptions({ schema: AdminOkResponse })
  removeStore(@Param('id', { schema: StoreId }) storeId: number) {
    return this.handler.removeStore(storeId);
  }

  @Get('/api/admin/stores/:id/merge')
  @SerializeOptions({ schema: AdminStoreMergeOptionsResponse })
  mergeOptions(@Param('id', { schema: StoreId }) storeId: number) {
    return this.handler.mergeOptions(storeId);
  }

  @Get('/api/admin/stores/:id/merge/:into')
  @SerializeOptions({ schema: AdminStoreMergePlanResponse })
  mergePlan(
    @Param('id', { schema: StoreId }) storeId: number,
    @Param('into', { schema: StoreId }) intoId: number,
  ) {
    return this.handler.mergePlan(storeId, intoId);
  }

  @Post('/api/admin/stores/:id/merge')
  @SerializeOptions({ schema: AdminStoreMergedResponse })
  merge(
    @Param('id', { schema: StoreId }) storeId: number,
    @Body({ schema: StoreMergeRequest }) body: z.infer<typeof StoreMergeRequest>,
  ) {
    return this.handler.merge(storeId, body);
  }
}
