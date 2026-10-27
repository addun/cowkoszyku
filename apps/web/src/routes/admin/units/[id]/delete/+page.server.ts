import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteUnit, getUnit } from '$lib/api/admin/units';

export const load = async ({ params }) => {
  const unit = await getUnit(params.id);
  if (unit.productCount > 0) {
    redirect(303, '/admin/units?error=' + encodeURIComponent(`Cannot delete “${unit.name}” while a product still uses it.`));
  }
  return { unit };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteUnit(params.id);
    if (!result.ok) {
      if (result.status === 409) redirect(303, '/admin/units?error=' + encodeURIComponent(result.message));
      return rejected(result.status, result.message);
    }
    redirect(303, '/admin/units');
  },
};
