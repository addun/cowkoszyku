import { redirect } from '@sveltejs/kit';
import { apiGet, apiSend, formInt, formJson, formText, rejected } from '$lib/admin/client';

export const load = async () => apiGet('/api/admin/comparison-groups/new');

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await apiSend<{ id: number }>('POST', '/api/admin/comparison-groups', {
      json: { name: formText(form, 'name'), unit_id: formInt(form, 'unit_id') },
    });
    if (!result.ok) {
      const shell = await apiGet<{ units: unknown[] }>('/api/admin/comparison-groups/new');
      return rejected(result.status, result.message, {
        group: { id: 0, name: form.name, unitId: form.unit_id },
        units: shell.units,
      });
    }
    redirect(303, `/admin/comparison-groups/${result.data.id}/edit`);
  },
};
