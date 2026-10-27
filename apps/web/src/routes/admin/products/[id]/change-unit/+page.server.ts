import { redirect } from '@sveltejs/kit';
import { formInt, formJson, rejected } from '$lib/admin/client';
import { changeProductUnit, getProductChangeUnit } from '$lib/api/admin/products';

export const load = async ({ params }) => getProductChangeUnit(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await changeProductUnit(params.id, { unit_id: formInt(form, 'unit_id') });
    if (!result.ok) return rejected(result.status, result.message, { newUnitId: form.unit_id });
    redirect(303, `/admin/products/${params.id}`);
  },
};
