import { redirect } from '@sveltejs/kit';
import { apiSend, formJson, formText, rejected } from '$lib/admin/client';

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await apiSend('POST', '/api/admin/units', { json: form });
    if (!result.ok) {
      return rejected(result.status, result.message, {
        name: formText(form, 'name'),
        compareValue: formText(form, 'compare_value'),
      });
    }
    redirect(303, '/admin/units');
  },
};
