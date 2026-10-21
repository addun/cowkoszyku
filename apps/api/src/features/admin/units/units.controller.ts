import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { z } from 'zod';
import {
  UnitId,
  UnitRequest,
  type AdminOkResponse,
  type AdminUnitResponse,
  type AdminUnitsResponse,
} from '@cowkoszyku/contract/admin/units';
import { AdminUnitsHandler } from './units.handler.js';

@Controller()
export class AdminUnitsController {
  constructor(private readonly handler: AdminUnitsHandler) {}

  @Get('/api/admin/units')
  list(): AdminUnitsResponse {
    return this.handler.list();
  }

  @Get('/api/admin/units/:id')
  get(@Param('id', { schema: UnitId }) unitId: number): AdminUnitResponse {
    return this.handler.get(unitId);
  }

  @Post('/api/admin/units')
  create(@Body({ schema: UnitRequest }) body: z.infer<typeof UnitRequest>): AdminUnitResponse {
    return this.handler.create(body);
  }

  @Patch('/api/admin/units/:id')
  update(
    @Param('id', { schema: UnitId }) unitId: number,
    @Body({ schema: UnitRequest }) body: z.infer<typeof UnitRequest>,
  ): AdminUnitResponse {
    return this.handler.update(unitId, body);
  }

  @Delete('/api/admin/units/:id')
  remove(@Param('id', { schema: UnitId }) unitId: number): AdminOkResponse {
    return this.handler.remove(unitId);
  }
}
