import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import type { PurchaseRequest } from '@cowkoszyku/contract/admin/catalog';
import { getPurchase, updatePurchase } from '$lib/api/admin/purchases';

export const load = async ({ params }) => getPurchase(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await updatePurchase(params.id, purchaseJson(form));
    if (!result.ok) {
      return rejected(result.status, result.message, {
        purchase: { id: Number(params.id), storeId: form.store_id, kind: form.kind, boughtOn: form.bought_on, amount: form.amount, quantity: form.quantity, isPrice: form.kind === 'price' },
      });
    }
    redirect(303, `/admin/products/${result.data.productId}`);
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
