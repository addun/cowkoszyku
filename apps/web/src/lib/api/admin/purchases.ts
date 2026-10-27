import type {
  AdminCatalogPurchaseDeletedResponse,
  AdminCatalogPurchaseFormResponse,
  AdminCatalogPurchaseResponse,
  AdminCatalogPurchaseUpdatedResponse,
  PurchaseRequest,
} from '@cowkoszyku/contract/admin/catalog';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function getNewPurchase(productId: Id): Promise<AdminCatalogPurchaseFormResponse> {
  return sendGet(`/api/admin/products/${pathId(productId)}/purchases/new`, { queryParams: null, body: null });
}

export function createPurchase(productId: Id, body: PurchaseRequest) {
  return sendPost<AdminCatalogPurchaseResponse>(`/api/admin/products/${pathId(productId)}/purchases`, {
    queryParams: null,
    body,
  });
}

export function getPurchase(id: Id): Promise<AdminCatalogPurchaseFormResponse> {
  return sendGet(`/api/admin/purchases/${pathId(id)}`, { queryParams: null, body: null });
}

export function updatePurchase(id: Id, body: PurchaseRequest) {
  return sendPatch<AdminCatalogPurchaseUpdatedResponse>(`/api/admin/purchases/${pathId(id)}`, { queryParams: null, body });
}

export function deletePurchase(id: Id) {
  return sendDelete<AdminCatalogPurchaseDeletedResponse>(`/api/admin/purchases/${pathId(id)}`, {
    queryParams: null,
    body: null,
  });
}
