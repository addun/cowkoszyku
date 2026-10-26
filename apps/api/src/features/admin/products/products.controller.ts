import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import { GetAdminProductsRequest, AdminProductsResponse } from '@cowkoszyku/contract/admin/products';
import { AdminProductsHandler } from './products.handler.js';

@Controller()
export class AdminProductsController {
  constructor(private readonly handler: AdminProductsHandler) {}

  @Get('/api/admin/products.json')
  @SerializeOptions({ schema: AdminProductsResponse })
  list(
    @Query({ schema: GetAdminProductsRequest }) query: z.infer<typeof GetAdminProductsRequest>,
  ) {
    return this.handler.list(query);
  }
}
