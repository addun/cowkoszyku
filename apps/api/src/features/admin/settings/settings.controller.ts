import { Body, Controller, Get, Patch, SerializeOptions } from '@nestjs/common';
import type { z } from 'zod';
import { UpdateAdminSettingsRequest, AdminSettingsResponse } from '@cowkoszyku/contract/admin/settings';
import { AdminSettingsHandler } from './settings.handler.js';

@Controller()
export class AdminSettingsController {
  constructor(private readonly handler: AdminSettingsHandler) {}

  @Get('/api/admin/settings')
  @SerializeOptions({ schema: AdminSettingsResponse })
  get() {
    return this.handler.get();
  }

  @Patch('/api/admin/settings')
  @SerializeOptions({ schema: AdminSettingsResponse })
  update(
    @Body({ schema: UpdateAdminSettingsRequest }) body: z.infer<typeof UpdateAdminSettingsRequest>,
  ) {
    return this.handler.update(body);
  }
}
