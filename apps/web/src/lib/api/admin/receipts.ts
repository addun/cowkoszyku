import type {
  AdminReceiptConfirmedResponse,
  AdminReceiptDeletedResponse,
  AdminReceiptDetailResponse,
  AdminReceiptDuplicatesResponse,
  AdminReceiptEditResponse,
  AdminReceiptIdResponse,
  AdminReceiptsResponse,
  ReceiptFormRequest,
  ReceiptsListRequest,
  ReceiptVisitRequest,
} from '@cowkoszyku/contract/admin/receipts';
import { sendGet, sendPost, sendPatch, sendDelete, pathId, type Id } from '$lib/common/http';

export function listReceipts(query: ReceiptsListRequest = {}): Promise<AdminReceiptsResponse> {
  return sendGet('/api/admin/receipts', { queryParams: query, body: null });
}

export function listReceiptDuplicates(): Promise<AdminReceiptDuplicatesResponse> {
  return sendGet('/api/admin/receipts/duplicates', { queryParams: null, body: null });
}

export function uploadReceipt(form: FormData) {
  return sendPost<AdminReceiptIdResponse>('/api/admin/receipts', { queryParams: null, body: form });
}

export function receiptPreviewPath(id: Id): string {
  return `/api/admin/receipts/${pathId(id)}/preview`;
}

export function getReceipt(id: Id): Promise<AdminReceiptDetailResponse> {
  return sendGet(`/api/admin/receipts/${pathId(id)}`, { queryParams: null, body: null });
}

export function getReceiptEdit(id: Id): Promise<AdminReceiptEditResponse> {
  return sendGet(`/api/admin/receipts/${pathId(id)}/edit`, { queryParams: null, body: null });
}

export function updateReceipt(id: Id, body: ReceiptVisitRequest) {
  return sendPatch<AdminReceiptIdResponse>(`/api/admin/receipts/${pathId(id)}`, { queryParams: null, body });
}

export function retryReceipt(id: Id) {
  return sendPost<AdminReceiptIdResponse>(`/api/admin/receipts/${pathId(id)}/retry`, { queryParams: null, body: null });
}

export function confirmReceipt(id: Id, body: ReceiptFormRequest) {
  return sendPost<AdminReceiptConfirmedResponse>(`/api/admin/receipts/${pathId(id)}/confirm`, { queryParams: null, body });
}

export function deleteReceipt(id: Id) {
  return sendDelete<AdminReceiptDeletedResponse>(`/api/admin/receipts/${pathId(id)}`, { queryParams: null, body: null });
}
