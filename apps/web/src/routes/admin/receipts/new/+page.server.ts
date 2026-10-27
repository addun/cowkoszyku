import { redirect } from '@sveltejs/kit';
import { multipart, rejected } from '$lib/admin/client';
import { listReceipts, uploadReceipt } from '$lib/api/admin/receipts';

export const load = async () => {
  const body = await listReceipts();
  return { configured: body.configured, model: body.model };
};

export const actions = {
  default: async ({ request }) => {
    const result = await uploadReceipt(multipart(await request.formData()));
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/receipts/${result.data.id}`);
  },
};
