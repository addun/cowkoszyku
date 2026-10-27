import { redirect } from '@sveltejs/kit';
import { formInt, formJson, formText, rejected } from '$lib/admin/client';
import { getSettings, updateSettings } from '$lib/api/admin/settings';

export const load = async () => getSettings();

export const actions = {
  default: async ({ request }) => {
    const form = formJson(await request.formData());
    const result = await updateSettings({
      ocr_model: formText(form, 'ocr_model'),
      piece_unit_id: formInt(form, 'piece_unit_id'),
      weight_unit_id: formInt(form, 'weight_unit_id'),
    });
    if (!result.ok) return rejected(result.status, result.message, { ocrModel: form.ocr_model, defaults: { pieceId: form.piece_unit_id, weightId: form.weight_unit_id } });
    redirect(303, '/admin/settings');
  },
};
