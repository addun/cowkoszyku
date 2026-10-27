import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { getReceiptEdit, updateReceipt } from '$lib/api/admin/receipts';

export const load = async ({ params }) => getReceiptEdit(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await updateReceipt(params.id, { bought_on: formText(form, 'bought_on'), store_id: formInt(form, 'store_id') });
    if (!result.ok) return rejected(result.status, result.message, { boughtOn: form.bought_on, store: { id: form.store_id } });
    redirect(303, `/admin/receipts/${params.id}`);
  },
};
