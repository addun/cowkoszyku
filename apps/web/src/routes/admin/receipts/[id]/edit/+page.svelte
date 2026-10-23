<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import StorePicker from '$lib/admin/StorePicker.svelte';
  import { toDatetimeLocal } from '$lib/format';
  import { resourceView, num, obj, text } from '$lib/admin/view';
  let { data, form } = $props();
  const props = $derived({
    receipt: data.receipt,
    boughtOn: form?.boughtOn ?? data.boughtOn,
    store: form?.store ?? data.store,
  });

  const view = $derived(resourceView(props));
  const receipt = $derived(obj(view.receipt));
  const store = $derived(obj(view.store));
  let storeId = $state(num(obj(data.store).id) ? text(obj(data.store).id) : '');
</script>

<svelte:head><title>Edit visit · cowkoszyku</title></svelte:head>

<Notice message={form?.message} />
<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Edit visit</h1>
  <p class="text-muted-foreground">Date and store for this bill.</p>
  <p class="text-muted-foreground text-sm">Saving applies these values to every product assigned to this receipt.</p>
</div>

<form method="post" action="/admin/receipts/{receipt.id}/edit">
  <Field.Group class="max-w-xl">
    <Field.Set>
      <Field.Legend>When</Field.Legend>
      <Field.Field>
        <Field.Label for="bought-on">Date and hour <span class="text-destructive">*</span></Field.Label>
        <Input id="bought-on" type="datetime-local" name="bought_on" required value={toDatetimeLocal(text(view.boughtOn))} />
      </Field.Field>
    </Field.Set>

    <Field.Set>
      <Field.Legend>Store</Field.Legend>
      <Field.Field>
        <Field.Label for="store">Store</Field.Label>
        <StorePicker id="store" bind:value={storeId} label={num(store.id) && text(store.id) === storeId ? text(store.label) : ''} />
      </Field.Field>
    </Field.Set>

    <div class="flex flex-wrap items-center gap-2">
      <Button type="submit">Save visit</Button>
      <Button variant="outline" href="/admin/receipts/{receipt.id}">Cancel</Button>
    </div>
  </Field.Group>
</form>
<Button variant="destructive" class="w-fit" href="/admin/receipts/{receipt.id}/delete">Delete receipt</Button>
