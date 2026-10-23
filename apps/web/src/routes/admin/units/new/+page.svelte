<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  let { form } = $props();
  const name = $derived(form ? String(form.name ?? '') : '');
  const compare = $derived(form ? String(form.compareValue ?? '') : '1');
</script>

<svelte:head><title>Add unit · cowkoszyku</title></svelte:head>

<Notice message={form?.message} />
<h1 class="text-2xl font-semibold tracking-tight">Add unit</h1>
<form method="post" action="/admin/units/new">
  <Field.Group class="max-w-xl">
    <Field.Field>
      <Field.Label for="name">Name <span class="text-destructive">*</span></Field.Label>
      <Input id="name" name="name" required value={name} autofocus />
    </Field.Field>
    <Field.Field>
      <Field.Label for="compare">Compare value <span class="text-destructive">*</span></Field.Label>
      <Input id="compare" name="compare_value" required inputmode="decimal" value={compare} />
      <Field.Description>Prices are shown per this much of the unit. Grams are usually 100, so 0,05 zł/g is shown as 5,00 zł / 100 g. Leave 1 to keep the price per single unit.</Field.Description>
    </Field.Field>
    <div class="flex flex-wrap items-center gap-2">
      <Button type="submit">Save</Button>
      <Button variant="outline" href="/admin/units">Cancel</Button>
    </div>
  </Field.Group>
</form>
