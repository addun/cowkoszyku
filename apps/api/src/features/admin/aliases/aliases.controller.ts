import { Body, Controller, Delete, Get, Param, Patch, Post, Query, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import { AdminAliasesHandler } from './aliases.handler.js';
import {
  AliasRequest,
  AliasId,
  AliasesListRequest,
  ProductRefRequest,
  AdminAliasDeletedResponse,
  AdminAliasFormResponse,
  AdminAliasResponse,
  AdminAliasesResponse,
} from '@cowkoszyku/contract/admin/aliases';

@Controller()
export class AdminAliasesController {
  constructor(private readonly handler: AdminAliasesHandler) {}

  @Get('/api/admin/aliases')
  @SerializeOptions({ schema: AdminAliasesResponse })
  list(@Query({ schema: AliasesListRequest }) query: z.infer<typeof AliasesListRequest>) {
    return this.handler.list(query);
  }

  @Get('/api/admin/aliases/new')
  @SerializeOptions({ schema: AdminAliasFormResponse })
  blank(@Query({ schema: ProductRefRequest }) query: z.infer<typeof ProductRefRequest>) {
    return this.handler.blank(query);
  }

  @Get('/api/admin/aliases/:id')
  @SerializeOptions({ schema: AdminAliasFormResponse })
  get(@Param('id', { schema: AliasId }) aliasId: number) {
    return this.handler.get(aliasId);
  }

  @Post('/api/admin/aliases')
  @SerializeOptions({ schema: AdminAliasResponse })
  create(@Body({ schema: AliasRequest }) body: z.infer<typeof AliasRequest>) {
    return this.handler.create(body);
  }

  @Patch('/api/admin/aliases/:id')
  @SerializeOptions({ schema: AdminAliasResponse })
  update(
    @Param('id', { schema: AliasId }) aliasId: number,
    @Body({ schema: AliasRequest }) body: z.infer<typeof AliasRequest>,
  ) {
    return this.handler.update(aliasId, body);
  }

  @Delete('/api/admin/aliases/:id')
  @SerializeOptions({ schema: AdminAliasDeletedResponse })
  remove(@Param('id', { schema: AliasId }) aliasId: number) {
    return this.handler.remove(aliasId);
  }
}
