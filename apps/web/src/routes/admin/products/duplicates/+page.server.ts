import { listProductDuplicates } from '$lib/api/admin/products';

export const load = async () => listProductDuplicates();
