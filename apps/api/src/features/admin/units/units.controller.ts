import { Body, Controller, Delete, Get, Param, Patch, Post, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import {
  UnitId,
  UnitRequest,
  AdminOkResponse,
  AdminUnitResponse,
  AdminUnitsResponse,
} from '@cowkoszyku/contract/admin/units';
import { AdminUnitsHandler } from './units.handler.js';

@Controller()
export class AdminUnitsController {
  constructor(private readonly handler: AdminUnitsHandler) {}

  @Get('/api/admin/units')
  @SerializeOptions({ schema: AdminUnitsResponse })
  list() {
    return this.handler.list();
  }

  @Get('/api/admin/units/:id')
  @SerializeOptions({ schema: AdminUnitResponse })
  get(@Param('id', { schema: UnitId }) unitId: number) {
    return this.handler.get(unitId);
  }

  @Post('/api/admin/units')
  @SerializeOptions({ schema: AdminUnitResponse })
  create(@Body({ schema: UnitRequest }) body: z.infer<typeof UnitRequest>) {
    return this.handler.create(body);
  }

  @Patch('/api/admin/units/:id')
  @SerializeOptions({ schema: AdminUnitResponse })
  update(
    @Param('id', { schema: UnitId }) unitId: number,
    @Body({ schema: UnitRequest }) body: z.infer<typeof UnitRequest>,
  ) {
    return this.handler.update(unitId, body);
  }

  @Delete('/api/admin/units/:id')
  @SerializeOptions({ schema: AdminOkResponse })
  remove(@Param('id', { schema: UnitId }) unitId: number) {
    return this.handler.remove(unitId);
  }
}
