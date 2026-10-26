import { Body, Controller, Get, Post, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import {
  BiedronkaShopsImportRequest,
  AdminBiedronkaImportedResponse,
  AdminBiedronkaImportResponse,
  AdminImportsResponse,
} from '@cowkoszyku/contract/admin/imports';
import { AdminImportsHandler } from './imports.handler.js';

@Controller()
export class AdminImportsController {
  constructor(private readonly handler: AdminImportsHandler) {}

  @Get('/api/admin/imports')
  @SerializeOptions({ schema: AdminImportsResponse })
  list() {
    return this.handler.list();
  }

  @Get('/api/admin/imports/biedronka')
  @SerializeOptions({ schema: AdminBiedronkaImportResponse })
  biedronka() {
    return this.handler.biedronka();
  }

  @Post('/api/admin/imports/biedronka')
  @SerializeOptions({ schema: AdminBiedronkaImportedResponse })
  importBiedronka(
    @Body({ schema: BiedronkaShopsImportRequest }) body: z.infer<typeof BiedronkaShopsImportRequest>,
  ) {
    return this.handler.importBiedronka(body);
  }
}
