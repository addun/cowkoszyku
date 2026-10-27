import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import type { PurchaseRequest } from '@cowkoszyku/contract/admin/catalog';
import { createPurchase, getNewPurchase } from '$lib/api/admin/purchases';

export const load = async ({ params }) => getNewPurchase(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await createPurchase(params.id, purchaseJson(form));
    if (!result.ok) return rejected(result.status, result.message, { purchase: purchaseDraft(form) });
    redirect(303, `/admin/products/${params.id}`);
  },
};

function purchaseJson(form: Record<string, unknown>): PurchaseRequest {
  return {
    store_id: formInt(form, 'store_id'),
    kind: formText(form, 'kind'),
    bought_on: formText(form, 'bought_on'),
    amount: formText(form, 'amount'),
    quantity: formText(form, 'quantity'),
  };
}

function purchaseDraft(json: Record<string, unknown>) {
  return { storeId: json.store_id, kind: json.kind, boughtOn: json.bought_on, amount: json.amount, quantity: json.quantity, isPrice: json.kind === 'price' };
}
