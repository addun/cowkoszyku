import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { z } from 'zod';
import {
  RetailChainId,
  StoreId,
  NewStoreRequest,
  RetailChainRequest,
  StoreMergeRequest,
  StoreRequest,
  type AdminChainResponse,
  type AdminChainsResponse,
  type AdminCreatedStoreResponse,
  type AdminNewStoreResponse,
  type AdminOkResponse,
  type AdminStoreFormResponse,
  type AdminStoreMergeOptionsResponse,
  type AdminStoreMergePlanResponse,
  type AdminStoreMergedResponse,
  type AdminStoreResponse,
  type AdminStoresResponse,
} from '@cowkoszyku/contract/admin/locations';
import { AdminLocationsHandler } from './locations.handler.js';

@Controller()
export class AdminLocationsController {
  constructor(private readonly handler: AdminLocationsHandler) {}

  @Get('/api/admin/retail-chains')
  chains(): AdminChainsResponse {
    return this.handler.chains();
  }

  @Get('/api/admin/retail-chains/:id')
  chain(@Param('id', { schema: RetailChainId }) chainId: number): AdminChainResponse {
    return this.handler.chain(chainId);
  }

  @Post('/api/admin/retail-chains')
  createChain(@Body({ schema: RetailChainRequest }) body: z.infer<typeof RetailChainRequest>): AdminChainResponse {
    return this.handler.createChain(body);
  }

  @Patch('/api/admin/retail-chains/:id')
  updateChain(
    @Param('id', { schema: RetailChainId }) chainId: number,
    @Body({ schema: RetailChainRequest }) body: z.infer<typeof RetailChainRequest>,
  ): AdminChainResponse {
    return this.handler.updateChain(chainId, body);
  }

  @Delete('/api/admin/retail-chains/:id')
  removeChain(@Param('id', { schema: RetailChainId }) chainId: number): AdminOkResponse {
    return this.handler.removeChain(chainId);
  }

  @Get('/api/admin/stores')
  stores(): AdminStoresResponse {
    return this.handler.stores();
  }

  @Get('/api/admin/stores/new')
  newStore(@Query({ schema: NewStoreRequest }) query: z.infer<typeof NewStoreRequest>): AdminNewStoreResponse {
    return this.handler.newStore(query);
  }

  @Get('/api/admin/stores/:id')
  store(@Param('id', { schema: StoreId }) storeId: number): AdminStoreFormResponse {
    return this.handler.store(storeId);
  }

  @Post('/api/admin/stores')
  createStore(@Body({ schema: StoreRequest }) body: z.infer<typeof StoreRequest>): AdminCreatedStoreResponse {
    return this.handler.createStore(body);
  }

  @Patch('/api/admin/stores/:id')
  updateStore(
    @Param('id', { schema: StoreId }) storeId: number,
    @Body({ schema: StoreRequest }) body: z.infer<typeof StoreRequest>,
  ): AdminStoreResponse {
    return this.handler.updateStore(storeId, body);
  }

  @Delete('/api/admin/stores/:id')
  removeStore(@Param('id', { schema: StoreId }) storeId: number): AdminOkResponse {
    return this.handler.removeStore(storeId);
  }

  @Get('/api/admin/stores/:id/merge')
  mergeOptions(@Param('id', { schema: StoreId }) storeId: number): AdminStoreMergeOptionsResponse {
    return this.handler.mergeOptions(storeId);
  }

  @Get('/api/admin/stores/:id/merge/:into')
  mergePlan(
    @Param('id', { schema: StoreId }) storeId: number,
    @Param('into', { schema: StoreId }) intoId: number,
  ): AdminStoreMergePlanResponse {
    return this.handler.mergePlan(storeId, intoId);
  }

  @Post('/api/admin/stores/:id/merge')
  merge(
    @Param('id', { schema: StoreId }) storeId: number,
    @Body({ schema: StoreMergeRequest }) body: z.infer<typeof StoreMergeRequest>,
  ): AdminStoreMergedResponse {
    return this.handler.merge(storeId, body);
  }
}
