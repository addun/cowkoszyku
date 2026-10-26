import { Body, Controller, Delete, Get, Param, Patch, Post, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import {
  ComparisonGroupProductsRequest,
  ComparisonGroupRequest,
  ComparisonGroupId,
  ProductId,
  AdminComparisonGroupDeletedResponse,
  AdminComparisonGroupFormResponse,
  AdminComparisonGroupResponse,
  AdminComparisonGroupsResponse,
} from '@cowkoszyku/contract/admin/groups';
import { AdminGroupsHandler } from './groups.handler.js';

@Controller()
export class AdminGroupsController {
  constructor(private readonly handler: AdminGroupsHandler) {}

  @Get('/api/admin/comparison-groups')
  @SerializeOptions({ schema: AdminComparisonGroupsResponse })
  list() {
    return this.handler.list();
  }

  @Get('/api/admin/comparison-groups/new')
  @SerializeOptions({ schema: AdminComparisonGroupFormResponse })
  blank() {
    return this.handler.blank();
  }

  @Get('/api/admin/comparison-groups/:id')
  @SerializeOptions({ schema: AdminComparisonGroupFormResponse })
  get(@Param('id', { schema: ComparisonGroupId }) groupId: number) {
    return this.handler.get(groupId);
  }

  @Post('/api/admin/comparison-groups')
  @SerializeOptions({ schema: AdminComparisonGroupResponse })
  create(@Body({ schema: ComparisonGroupRequest }) body: z.infer<typeof ComparisonGroupRequest>) {
    return this.handler.create(body);
  }

  @Patch('/api/admin/comparison-groups/:id')
  @SerializeOptions({ schema: AdminComparisonGroupResponse })
  update(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Body({ schema: ComparisonGroupRequest }) body: z.infer<typeof ComparisonGroupRequest>,
  ) {
    return this.handler.update(groupId, body);
  }

  @Post('/api/admin/comparison-groups/:id/products')
  @SerializeOptions({ schema: AdminComparisonGroupResponse })
  addProducts(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Body({ schema: ComparisonGroupProductsRequest }) body: z.infer<typeof ComparisonGroupProductsRequest>,
  ) {
    return this.handler.addProducts(groupId, body.product_id);
  }

  @Delete('/api/admin/comparison-groups/:id/products/:productId')
  @SerializeOptions({ schema: AdminComparisonGroupResponse })
  removeProduct(
    @Param('id', { schema: ComparisonGroupId }) groupId: number,
    @Param('productId', { schema: ProductId }) productId: number,
  ) {
    return this.handler.removeProduct(groupId, productId);
  }

  @Delete('/api/admin/comparison-groups/:id')
  @SerializeOptions({ schema: AdminComparisonGroupDeletedResponse })
  remove(@Param('id', { schema: ComparisonGroupId }) groupId: number) {
    return this.handler.remove(groupId);
  }
}
