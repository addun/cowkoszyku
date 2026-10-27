import type { AdminChainResponse, AdminChainsResponse, AdminOkResponse, RetailChainRequest } from '@cowkoszyku/contract/admin/locations';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listRetailChains(): Promise<AdminChainsResponse> {
  return sendGet('/api/admin/retail-chains', { queryParams: null, body: null });
}

export function getRetailChain(id: Id): Promise<AdminChainResponse> {
  return sendGet(`/api/admin/retail-chains/${pathId(id)}`, { queryParams: null, body: null });
}

export function createRetailChain(body: RetailChainRequest) {
  return sendPost<AdminChainResponse>('/api/admin/retail-chains', { queryParams: null, body });
}

export function updateRetailChain(id: Id, body: RetailChainRequest) {
  return sendPatch<AdminChainResponse>(`/api/admin/retail-chains/${pathId(id)}`, { queryParams: null, body });
}

export function deleteRetailChain(id: Id) {
  return sendDelete<AdminOkResponse>(`/api/admin/retail-chains/${pathId(id)}`, { queryParams: null, body: null });
}
