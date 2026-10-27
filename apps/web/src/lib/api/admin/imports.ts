import type {
  AdminBiedronkaImportedResponse,
  AdminBiedronkaImportResponse,
  AdminImportsResponse,
  BiedronkaShopsImportRequest,
} from '@cowkoszyku/contract/admin/imports';
import { sendGet, sendPost } from '$lib/common/http';

export function listImports(): Promise<AdminImportsResponse> {
  return sendGet('/api/admin/imports', { queryParams: null, body: null });
}

export function getBiedronkaImport(): Promise<AdminBiedronkaImportResponse> {
  return sendGet('/api/admin/imports/biedronka', { queryParams: null, body: null });
}

export function importBiedronkaShops(body: BiedronkaShopsImportRequest) {
  return sendPost<AdminBiedronkaImportedResponse>('/api/admin/imports/biedronka', {
    queryParams: null,
    body,
  });
}
