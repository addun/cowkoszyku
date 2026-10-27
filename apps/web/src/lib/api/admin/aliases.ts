import type {
  AdminAliasDeletedResponse,
  AdminAliasFormResponse,
  AdminAliasResponse,
  AdminAliasesResponse,
  AliasesListRequest,
  AliasRequest,
  ProductRefRequest,
} from '@cowkoszyku/contract/admin/aliases';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listAliases(query: AliasesListRequest = {}) {
  return sendGet<AdminAliasesResponse>('/api/admin/aliases', {
    queryParams: query,
    body: null,
  });
}

export function getNewAlias(query: ProductRefRequest = {}): Promise<AdminAliasFormResponse> {
  return sendGet('/api/admin/aliases/new', { queryParams: query, body: null });
}

export function getAlias(id: Id): Promise<AdminAliasFormResponse> {
  return sendGet(`/api/admin/aliases/${pathId(id)}`, { queryParams: null, body: null });
}

export function createAlias(body: AliasRequest) {
  return sendPost<AdminAliasResponse>('/api/admin/aliases', { queryParams: null, body });
}

export function updateAlias(id: Id, body: AliasRequest) {
  return sendPatch<AdminAliasResponse>(`/api/admin/aliases/${pathId(id)}`, { queryParams: null, body });
}

export function deleteAlias(id: Id) {
  return sendDelete<AdminAliasDeletedResponse>(`/api/admin/aliases/${pathId(id)}`, { queryParams: null, body: null });
}
