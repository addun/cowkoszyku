import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { queryParams, queryValue } from '$lib/common/http';
import { confirmReceipt, getReceipt, retryReceipt } from '$lib/api/admin/receipts';

export const load = async ({ params, url }) => {
  const query = queryParams(url);
  const body = await getReceipt(params.id);
  return { ...body, error: queryValue(query, 'error'), imported: Number(queryValue(query, 'imported')) || 0 };
};

export const actions = {
  default: async ({ request, params }) => {
    const result = await confirmReceipt(params.id, receiptForm(await request.formData()));
    if (!result.ok) {
      if (result.body.view) return rejected(result.status, result.message, result.body);
      return rejected(result.status, result.message);
    }
    redirect(303, `/admin/receipts/${params.id}?imported=${result.data.imported}`);
  },
  retry: async ({ params }) => {
    const result = await retryReceipt(params.id);
    if (!result.ok) redirect(303, `/admin/receipts/${params.id}?error=${encodeURIComponent(result.message)}`);
    redirect(303, `/admin/receipts/${params.id}`);
  },
};

function receiptForm(form: FormData): Record<string, string> {
  const body: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') body[key] = value;
  }
  return body;
}
