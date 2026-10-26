import { Injectable } from '@nestjs/common';
import type { z } from 'zod';
import { ComparisonGroupsRepository } from '#app/store/comparison-groups';
import { UnitsRepository } from '#app/store/units';
import { type ComparisonGroupRequest } from '@cowkoszyku/contract/admin/groups';

@Injectable()
export class AdminGroupsHandler {
  constructor(
    private readonly groups: ComparisonGroupsRepository,
    private readonly units: UnitsRepository,
  ) {}

  list() {
    return { groups: this.groups.listComparisonGroups() };
  }

  blank() {
    return this.form({ id: 0, name: '', unitId: 0, unitName: '', createdAt: '', productCount: 0 });
  }

  get(groupId: number) {
    const group = this.groups.getComparisonGroup(groupId);
    return this.form(group);
  }

  create(body: z.infer<typeof ComparisonGroupRequest>) {
    return this.groups.createComparisonGroup(body.name, body.unit_id, body.product_id ?? []);
  }

  update(groupId: number, body: z.infer<typeof ComparisonGroupRequest>) {
    this.groups.getComparisonGroup(groupId);
    this.groups.updateComparisonGroup(groupId, body.name, body.unit_id, body.product_id);
    return this.groups.getComparisonGroup(groupId);
  }

  addProducts(groupId: number, productIds: number[]) {
    this.groups.addComparisonGroupProducts(groupId, productIds);
    return this.groups.getComparisonGroup(groupId);
  }

  removeProduct(groupId: number, productId: number) {
    this.groups.removeComparisonGroupProduct(groupId, productId);
    return this.groups.getComparisonGroup(groupId);
  }

  remove(groupId: number) {
    const group = this.groups.getComparisonGroup(groupId);
    this.groups.deleteComparisonGroup(groupId);
    return { ok: true, name: group.name };
  }

  private form(
    group: { id: number; name: string; unitId: number; unitName: string; createdAt: string; productCount: number },
  ) {
    return {
      group,
      units: this.units.listUnits(),
      products: group.id ? this.groups.listComparisonGroupMembers(group.id) : [],
    };
  }
}
