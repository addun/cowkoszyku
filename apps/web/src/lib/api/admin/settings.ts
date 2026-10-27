import type { AdminSettingsResponse, UpdateAdminSettingsRequest } from '@cowkoszyku/contract/admin/settings';
import { sendGet, sendPatch } from '$lib/common/http';

export function getSettings(): Promise<AdminSettingsResponse> {
  return sendGet('/api/admin/settings', { queryParams: null, body: null });
}

export function updateSettings(body: UpdateAdminSettingsRequest) {
  return sendPatch<AdminSettingsResponse>('/api/admin/settings', { queryParams: null, body });
}
