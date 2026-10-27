import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { getComparisonGroup, removeComparisonGroupProduct, updateComparisonGroup } from '$lib/api/admin/groups';

export const load = async ({ params }) => getComparisonGroup(params.id);

export const actions = {
  save: async ({ request, params }) => {
    const form = formJson(await request.formData());
    const result = await updateComparisonGroup(params.id, { name: formText(form, 'name'), unit_id: formInt(form, 'unit_id') });
    if (!result.ok) {
      const shell = await getComparisonGroup(params.id);
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
    const result = await removeComparisonGroupProduct(params.id, productId);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, `/admin/comparison-groups/${params.id}/edit`);
  },
};
