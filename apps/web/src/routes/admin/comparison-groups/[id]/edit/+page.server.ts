import { redirect } from '@sveltejs/kit';
import { apiGet, apiSend, formInt, formJson, formText, rejected } from '$lib/admin/client';

export const load = async ({ params }) => apiGet(`/api/admin/comparison-groups/${params.id}`);

export const actions = {
  save: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await apiSend('PATCH', `/api/admin/comparison-groups/${params.id}`, {
      json: { name: formText(form, 'name'), unit_id: formInt(form, 'unit_id') },
    });
    if (!result.ok) {
      const shell = await apiGet<{ units: unknown[] }>(`/api/admin/comparison-groups/${params.id}`);
      return rejected(result.status, result.message, {
        group: { id: Number(params.id), name: form.name, unitId: form.unit_id },
        units: shell.units,
      });
    }
    redirect(303, '/admin/comparison-groups');
  },

  remove: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const productId = formInt(form, 'product_id');
    if (!productId) return rejected(400, 'Choose a product.');
    const result = await apiSend('DELETE', `/api/admin/comparison-groups/${params.id}/products/${productId}`);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/comparison-groups/${params.id}/edit`);
  },
};
