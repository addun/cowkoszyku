import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { z } from 'zod';
import {
  ComparisonGroupProductsRequest,
  ComparisonGroupRequest,
  ComparisonGroupId,
  ProductId,
  type AdminComparisonGroupDeletedResponse,
  type AdminComparisonGroupFormResponse,
  type AdminComparisonGroupResponse,
  type AdminComparisonGroupsResponse,
} from '@cowkoszyku/contract/admin/groups';
import { AdminGroupsHandler } from './groups.handler.js';

@Controller()
export class AdminGroupsController {
  constructor(private readonly handler: AdminGroupsHandler) {}

  @Get('/api/admin/comparison-groups')
  list(): AdminComparisonGroupsResponse {
    return this.handler.list();
  }

  @Get('/api/admin/comparison-groups/new')
  blank(): AdminComparisonGroupFormResponse {
    return this.handler.blank();
  }

  @Get('/api/admin/comparison-groups/:id')
  get(@Param('id', { schema: ComparisonGroupId }) groupId: number): AdminComparisonGroupFormResponse {
    return this.handler.get(groupId);
  }

  @Post('/api/admin/comparison-groups')
  create(@Body({ schema: ComparisonGroupRequest }) body: z.infer<typeof ComparisonGroupRequest>): AdminComparisonGroupResponse {
    return this.handler.create(body);
  }

  @Patch('/api/admin/comparison-groups/:id')
  update(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Body({ schema: ComparisonGroupRequest }) body: z.infer<typeof ComparisonGroupRequest>,
  ): AdminComparisonGroupResponse {
    return this.handler.update(groupId, body);
  }

  @Post('/api/admin/comparison-groups/:id/products')
  addProducts(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Body({ schema: ComparisonGroupProductsRequest }) body: z.infer<typeof ComparisonGroupProductsRequest>,
  ): AdminComparisonGroupResponse {
    return this.handler.addProducts(groupId, body.product_id);
  }

  @Delete('/api/admin/comparison-groups/:id/products/:productId')
  removeProduct(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Param('productId', { schema: ProductId }) productId: number,
  ): AdminComparisonGroupResponse {
    return this.handler.removeProduct(groupId, productId);
  }

  @Delete('/api/admin/comparison-groups/:id')
  remove(@Param('id', { schema: ComparisonGroupId }) groupId: number): AdminComparisonGroupDeletedResponse {
    return this.handler.remove(groupId);
  }
}
