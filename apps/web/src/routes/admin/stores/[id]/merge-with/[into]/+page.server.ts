import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { getStoreMergePlan, mergeStore } from '$lib/api/admin/stores';

export const load = async ({ params }) => getStoreMergePlan(params.id, params.into);

export const actions = {
  default: async ({ params }) => {
    const result = await mergeStore(params.id, { into_id: Number(params.into) });
    if (!result.ok) return rejected(result.status, result.message);
    redirect(303, '/admin/stores');
  },
};
