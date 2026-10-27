import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type { z } from 'zod';
import { parseDecimal } from '../../../domain/format.js';
import { UnitsRepository } from '#app/store/units';
import { UnitRequest } from '@cowkoszyku/contract/admin/units';

@Injectable()
export class AdminUnitsHandler {
  constructor(private readonly units: UnitsRepository) {}

  list() {
    return { units: this.units.listUnits() };
  }

  get(unitId: number) {
    return this.units.getUnit(unitId);
  }

  create(body: z.infer<typeof UnitRequest>) {
    const compare = readCompareValue(body.compare_value);
    if (compare.error || !compare.value) throw new UnprocessableEntityException(compare.error || 'Compare value is required.');
    return this.units.createUnit(body.name, compare.value);
  }

  update(unitId: number, body: z.infer<typeof UnitRequest>) {
    const compare = readCompareValue(body.compare_value);
    if (compare.error || !compare.value) throw new UnprocessableEntityException(compare.error || 'Compare value is required.');
    this.units.updateUnit(unitId, body.name, compare.value);
    return this.units.getUnit(unitId);
  }

  remove(unitId: number) {
    const unit = this.units.getUnit(unitId);
    if (unit.productCount > 0) throw new ConflictException(`Cannot delete “${unit.name}” while a product still uses it.`);
    this.units.deleteUnit(unitId);
    return { ok: true };
  }
}

function readCompareValue(raw: string): { value: Decimal | null; error: string } {
  try {
    return { value: parseDecimal(raw, 6, false), error: '' };
  } catch (err) {
    const message = (err as Error).message;
    return { value: null, error: message.endsWith('.') ? `Compare value ${message}` : `Compare value ${message}.` };
  }
}
