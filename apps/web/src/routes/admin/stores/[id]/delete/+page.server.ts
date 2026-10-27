import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteStore, getStore } from '$lib/api/admin/stores';

export const load = async ({ params }) => {
  const body = await getStore(params.id);
  if (body.store.purchaseCount > 0) {
    redirect(303, '/admin/stores?error=' + encodeURIComponent(`Cannot delete “${body.store.name}” while a purchase still uses it.`));
  }
  return { store: body.store };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteStore(params.id);
    if (!result.ok) {
      if (result.status === 409) redirect(303, '/admin/stores?error=' + encodeURIComponent(result.message));
      return rejected(result.status, result.message);
    }
    redirect(303, '/admin/stores');
  },
};
