import { redirect } from '@sveltejs/kit';
import { rejected } from '$lib/admin/client';
import { deleteRetailChain, getRetailChain } from '$lib/api/admin/retail-chains';

export const load = async ({ params }) => {
  const chain = await getRetailChain(params.id);
  if (chain.storeCount > 0) {
    redirect(303, '/admin/retail-chains?error=' + encodeURIComponent(`Cannot delete “${chain.name}” while a store still uses it.`));
  }
  return { chain };
};

export const actions = {
  default: async ({ params }) => {
    const result = await deleteRetailChain(params.id);
    if (!result.ok) {
      if (result.status === 409) redirect(303, '/admin/retail-chains?error=' + encodeURIComponent(result.message));
      return rejected(result.status, result.message);
    }
    redirect(303, '/admin/retail-chains');
  },
};
