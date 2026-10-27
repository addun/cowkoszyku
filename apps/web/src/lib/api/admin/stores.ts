import type {
  AdminCreatedStoreResponse,
  AdminNewStoreResponse,
  AdminOkResponse,
  AdminStoreFormResponse,
  AdminStoreMergeOptionsResponse,
  AdminStoreMergePlanResponse,
  AdminStoreMergedResponse,
  AdminStoreResponse,
  AdminStoresResponse,
  StoreMergeRequest,
  StoreRequest,
  StoresListRequest,
} from '@cowkoszyku/contract/admin/locations';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, queryParams, type Id } from '$lib/common/http';

export function listStores(query: StoresListRequest = {}) {
  return sendGet<AdminStoresResponse>('/api/admin/stores', {
    queryParams: query,
    body: null,
  });
}

export function getNewStore(search = ''): Promise<AdminNewStoreResponse> {
  return sendGet('/api/admin/stores/new', { queryParams: queryParams(search), body: null });
}

export function getStore(id: Id): Promise<AdminStoreFormResponse> {
  return sendGet(`/api/admin/stores/${pathId(id)}`, { queryParams: null, body: null });
}

export function createStore(body: StoreRequest) {
  return sendPost<AdminCreatedStoreResponse>('/api/admin/stores', { queryParams: null, body });
}

export function updateStore(id: Id, body: StoreRequest) {
  return sendPatch<AdminStoreResponse>(`/api/admin/stores/${pathId(id)}`, { queryParams: null, body });
}

export function deleteStore(id: Id) {
  return sendDelete<AdminOkResponse>(`/api/admin/stores/${pathId(id)}`, { queryParams: null, body: null });
}

export function getStoreMerge(id: Id): Promise<AdminStoreMergeOptionsResponse> {
  return sendGet(`/api/admin/stores/${pathId(id)}/merge`, { queryParams: null, body: null });
}

export function getStoreMergePlan(id: Id, intoId: Id): Promise<AdminStoreMergePlanResponse> {
  return sendGet(`/api/admin/stores/${pathId(id)}/merge/${pathId(intoId)}`, { queryParams: null, body: null });
}

export function mergeStore(id: Id, body: StoreMergeRequest) {
  return sendPost<AdminStoreMergedResponse>(`/api/admin/stores/${pathId(id)}/merge`, {
    queryParams: null,
    body,
  });
}
