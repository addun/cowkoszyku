import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { z } from 'zod';
import { UpdateAdminSettingsRequest, type AdminSettingsResponse } from '@cowkoszyku/contract/admin/settings';
import { AdminSettingsHandler } from './settings.handler.js';

@Controller()
export class AdminSettingsController {
  constructor(private readonly handler: AdminSettingsHandler) {}

  @Get('/api/admin/settings')
  get(): AdminSettingsResponse {
    return this.handler.get();
  }

  @Patch('/api/admin/settings')
  update(
    @Body({ schema: UpdateAdminSettingsRequest }) body: z.infer<typeof UpdateAdminSettingsRequest>,
  ): AdminSettingsResponse {
    return this.handler.update(body);
  }
}
