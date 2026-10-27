import { redirect } from '@sveltejs/kit';
import { formJson, formText, rejected } from '$lib/admin/client';
import { createUnit } from '$lib/api/admin/units';

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await createUnit({ name: formText(form, 'name'), compare_value: formText(form, 'compare_value') });
    if (!result.ok) {
      return rejected(result.status, result.message, {
        name: formText(form, 'name'),
        compareValue: formText(form, 'compare_value'),
      });
    }
    redirect(303, '/admin/units');
  },
};
