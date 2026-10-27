import type {
  AdminCatalogBlankResponse,
  AdminCatalogChangeUnitResponse,
  AdminCatalogIdResponse,
  AdminCatalogMergeOptionsResponse,
  AdminCatalogMergePlanResponse,
  AdminCatalogOkResponse,
  AdminCatalogShowResponse,
  MergeRequest,
  UnitIdRequest,
} from '@cowkoszyku/contract/admin/catalog';
import type { AdminProductDuplicatesResponse, AdminProductsResponse, GetAdminProductsRequest } from '@cowkoszyku/contract/admin/products';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listProducts(query: GetAdminProductsRequest = {}) {
  return sendGet<AdminProductsResponse>('/api/admin/products.json', {
    queryParams: query,
    body: null,
  });
}

export function listProductDuplicates(): Promise<AdminProductDuplicatesResponse> {
  return sendGet('/api/admin/products/duplicates', { queryParams: null, body: null });
}

export function getNewProduct(): Promise<AdminCatalogBlankResponse> {
  return sendGet('/api/admin/products/new', { queryParams: null, body: null });
}

export function getProduct(id: Id): Promise<AdminCatalogShowResponse> {
  return sendGet(`/api/admin/products/${pathId(id)}`, { queryParams: null, body: null });
}

export function getProductEdit(id: Id): Promise<AdminCatalogBlankResponse> {
  return sendGet(`/api/admin/products/${pathId(id)}/edit`, { queryParams: null, body: null });
}

export function createProduct(form: FormData) {
  return sendPost<AdminCatalogIdResponse>('/api/admin/products', { queryParams: null, body: form });
}

export function updateProduct(id: Id, form: FormData) {
  return sendPatch<AdminCatalogIdResponse>(`/api/admin/products/${pathId(id)}`, { queryParams: null, body: form });
}

export function deleteProduct(id: Id) {
  return sendDelete<AdminCatalogOkResponse>(`/api/admin/products/${pathId(id)}`, { queryParams: null, body: null });
}

export function getProductChangeUnit(id: Id): Promise<AdminCatalogChangeUnitResponse> {
  return sendGet(`/api/admin/products/${pathId(id)}/change-unit`, { queryParams: null, body: null });
}

export function changeProductUnit(id: Id, body: UnitIdRequest) {
  return sendPost<AdminCatalogIdResponse>(`/api/admin/products/${pathId(id)}/change-unit`, {
    queryParams: null,
    body,
  });
}

export function getProductMerge(id: Id): Promise<AdminCatalogMergeOptionsResponse> {
  return sendGet(`/api/admin/products/${pathId(id)}/merge`, { queryParams: null, body: null });
}

export function getProductMergePlan(id: Id, intoId: Id): Promise<AdminCatalogMergePlanResponse> {
  return sendGet(`/api/admin/products/${pathId(id)}/merge/${pathId(intoId)}`, { queryParams: null, body: null });
}

export function mergeProduct(id: Id, body: MergeRequest) {
  return sendPost<AdminCatalogIdResponse>(`/api/admin/products/${pathId(id)}/merge`, {
    queryParams: null,
    body,
  });
}
