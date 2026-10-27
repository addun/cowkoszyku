import { redirect } from '@sveltejs/kit';
import { formJson, formText, rejected } from '$lib/admin/client';
import { getUnit, updateUnit } from '$lib/api/admin/units';

export const load = async ({ params }) => getUnit(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await updateUnit(params.id, { name: formText(form, 'name'), compare_value: formText(form, 'compare_value') });
    if (!result.ok) {
      return rejected(result.status, result.message, {
        unit: { id: Number(params.id), name: form.name, compareValue: form.compare_value, productCount: 0 },
        compareInput: String(form.compare_value ?? ''),
      });
    }
    redirect(303, '/admin/units');
  },
};
