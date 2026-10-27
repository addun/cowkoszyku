import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteReceipt, getReceipt } from '$lib/api/admin/receipts';

export const load = async ({ params }) => {
  const body = await getReceipt(params.id);
  const status = body.kind === 'review' ? body.view.status : body.receipt.status;
  return { status };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteReceipt(params.id);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, '/admin/receipts');
  },
};
