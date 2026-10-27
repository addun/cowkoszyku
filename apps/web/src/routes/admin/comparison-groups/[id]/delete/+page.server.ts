import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteComparisonGroup, getComparisonGroup } from '$lib/api/admin/groups';

export const load = async ({ params }) => {
  const body = await getComparisonGroup(params.id);
  return { group: body.group };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteComparisonGroup(params.id);
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, '/admin/comparison-groups');
  },
};
