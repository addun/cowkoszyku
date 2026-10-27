import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { createComparisonGroup, getNewComparisonGroup } from '$lib/api/admin/groups';

export const load = async () => getNewComparisonGroup();

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await createComparisonGroup({ name: formText(form, 'name'), unit_id: formInt(form, 'unit_id') });
    if (!result.ok) {
      const shell = await getNewComparisonGroup();
      return rejected(result.status, result.message, {
        group: { id: 0, name: form.name, unitId: form.unit_id },
        units: shell.units,
      });
    }
    redirect(303, `/admin/comparison-groups/${result.data.id}/edit`);
  },
};
