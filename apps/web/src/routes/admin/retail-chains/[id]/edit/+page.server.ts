import { redirect } from '@sveltejs/kit';
import { formJson, formText, rejected } from '$lib/admin/client';
import { getRetailChain, updateRetailChain } from '$lib/api/admin/retail-chains';

export const load = async ({ params }) => ({ retailChain: await getRetailChain(params.id) });

export const actions = {
  default: async ({ request, params }) => {
    const json = formJson(await request.formData());
    const result = await updateRetailChain(params.id, {
      name: formText(json, 'name'),
      legal_name: formText(json, 'legal_name'),
      tax_id: formText(json, 'tax_id'),
    });
    if (!result.ok) {
      return rejected(result.status, result.message, {
        retailChain: { id: Number(params.id), name: json.name, legalName: json.legal_name, taxId: json.tax_id },
      });
    }
    redirect(303, '/admin/retail-chains');
  },
};
