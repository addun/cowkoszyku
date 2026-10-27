import { listReceiptDuplicates } from '$lib/api/admin/receipts';

export const load = async () => listReceiptDuplicates();
