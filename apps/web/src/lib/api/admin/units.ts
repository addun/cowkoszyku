import type { AdminOkResponse, AdminUnitResponse, AdminUnitsResponse, UnitRequest } from '@cowkoszyku/contract/admin/units';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listUnits(): Promise<AdminUnitsResponse> {
  return sendGet('/api/admin/units', { queryParams: null, body: null });
}

export function getUnit(id: Id): Promise<AdminUnitResponse> {
  return sendGet(`/api/admin/units/${pathId(id)}`, { queryParams: null, body: null });
}

export function createUnit(body: UnitRequest) {
  return sendPost<AdminUnitResponse>('/api/admin/units', { queryParams: null, body });
}

export function updateUnit(id: Id, body: UnitRequest) {
  return sendPatch<AdminUnitResponse>(`/api/admin/units/${pathId(id)}`, { queryParams: null, body });
}

export function deleteUnit(id: Id) {
  return sendDelete<AdminOkResponse>(`/api/admin/units/${pathId(id)}`, { queryParams: null, body: null });
}
