import { formInt, formJson, rejected } from '$lib/admin/client';
import { getBiedronkaImport, importBiedronkaShops } from '$lib/api/admin/imports';

export const load = async () => getBiedronkaImport();

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await importBiedronkaShops({ retail_chain_id: formInt(form, 'retail_chain_id') });
    if (!result.ok) return rejected(result.status, result.message, { retailChainId: form.retail_chain_id });
    return { retailChainId: result.data.retailChainId, result: result.data.result };
  },
};
