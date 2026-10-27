import { redirect } from '@sveltejs/kit';
import { formJson, multipart, rejected } from '$lib/admin/client';
import { createProduct, getNewProduct, getProductEdit, updateProduct } from '$lib/api/admin/products';

async function save(request: Request, productId: number) {
  const form = await request.formData();
  const json = formJson(form);
  const result = productId ? await updateProduct(productId, multipart(form)) : await createProduct(multipart(form));
  if (!result.ok) {
    const shell = productId ? await getProductEdit(productId) : await getNewProduct();
    const selected = new Set(list(json.group_id).map((id) => Number(id)));
    const ids = list(json.extra_unit_id);
    const factors = list(json.extra_factor);
    const conversions = [];
    for (let i = 0; i < Math.max(ids.length, factors.length); i++) {
      if (!ids[i] && !factors[i]) continue;
      conversions.push({ unitId: Number(ids[i]) || 0, factor: factors[i] ?? '' });
    }
    return rejected(result.status, result.message, {
      product: { ...shell.product, id: productId, name: json.name, ean: json.ean, unitId: json.unit_id, conversions },
      units: shell.units,
      groups: shell.groups.map((group) => ({ ...group, selected: selected.has(group.id) })),
    });
  }
  redirect(303, `/admin/products/${result.data.id}`);
}

function list(value: unknown): string[] {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export const load = async ({ params }) => getProductEdit(params.id);
export const actions = { default: async ({ request, params }) => save(request, Number(params.id)) };
