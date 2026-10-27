import { formJson, rejected } from '$lib/admin/client';
import { getStoreMerge } from '$lib/api/admin/stores';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => getStoreMerge(params.id);

export const actions = {
  default: async ({ request, params }) => {
    const json = formJson(await request.formData());
    const into = Number(json.into_id) || 0;
    if (!into) return rejected(422, 'Choose a store.', { intoId: 0 });
    redirect(303, `/admin/stores/${params.id}/merge-with/${into}`);
  },
};
