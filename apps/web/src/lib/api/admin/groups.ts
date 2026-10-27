import type {
  AdminComparisonGroupDeletedResponse,
  AdminComparisonGroupFormResponse,
  AdminComparisonGroupResponse,
  AdminComparisonGroupsResponse,
  ComparisonGroupProductsRequest,
  ComparisonGroupRequest,
} from '@cowkoszyku/contract/admin/groups';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listComparisonGroups(): Promise<AdminComparisonGroupsResponse> {
  return sendGet('/api/admin/comparison-groups', { queryParams: null, body: null });
}

export function getNewComparisonGroup(): Promise<AdminComparisonGroupFormResponse> {
  return sendGet('/api/admin/comparison-groups/new', { queryParams: null, body: null });
}

export function getComparisonGroup(id: Id): Promise<AdminComparisonGroupFormResponse> {
  return sendGet(`/api/admin/comparison-groups/${pathId(id)}`, { queryParams: null, body: null });
}

export function createComparisonGroup(body: ComparisonGroupRequest) {
  return sendPost<AdminComparisonGroupResponse>('/api/admin/comparison-groups', { queryParams: null, body });
}

export function updateComparisonGroup(id: Id, body: ComparisonGroupRequest) {
  return sendPatch<AdminComparisonGroupResponse>(`/api/admin/comparison-groups/${pathId(id)}`, { queryParams: null, body });
}

export function addComparisonGroupProducts(id: Id, body: ComparisonGroupProductsRequest) {
  return sendPost<AdminComparisonGroupResponse>(`/api/admin/comparison-groups/${pathId(id)}/products`, {
    queryParams: null,
    body,
  });
}

export function removeComparisonGroupProduct(id: Id, productId: Id) {
  return sendDelete<AdminComparisonGroupResponse>(`/api/admin/comparison-groups/${pathId(id)}/products/${pathId(productId)}`, {
    queryParams: null,
    body: null,
  });
}

export function deleteComparisonGroup(id: Id) {
  return sendDelete<AdminComparisonGroupDeletedResponse>(`/api/admin/comparison-groups/${pathId(id)}`, {
    queryParams: null,
    body: null,
  });
}
