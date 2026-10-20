import { Module } from '@nestjs/common';
import { ComparisonGroupsModule } from '#app/store/comparison-groups';
import { UnitsModule } from '#app/store/units';
import { AdminGroupsController } from './groups.controller.js';
import { AdminGroupsHandler } from './groups.handler.js';

@Module({
  imports: [ComparisonGroupsModule, UnitsModule],
  controllers: [AdminGroupsController],
  providers: [AdminGroupsHandler],
})
export class AdminGroupsModule {}
