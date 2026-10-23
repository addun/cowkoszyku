<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import ProductPicker from '$lib/admin/ProductPicker.svelte';
  import { resourceView, num, obj, text } from '$lib/admin/view';
  let { data, form } = $props();
  const props = $derived({
    product: data.product,
  });

  const view = $derived(resourceView(props));
  const product = $derived(obj(view.product));
  let intoId = $state(num(form?.intoId) ? text(form.intoId) : '');
</script>

<svelte:head><title>Merge product · cowkoszyku</title></svelte:head>

<Notice message={form?.message} />
<div class="flex max-w-xl flex-col gap-4">
  <h1 class="text-2xl font-semibold tracking-tight">Merge {text(product.name)}?</h1>
  <p class="text-muted-foreground">Pick the product to keep. You will see a summary before anything is removed.</p>
  <form method="post" action="/admin/products/{product.id}/merge-with">
    <Field.Group>
      <Field.Field>
        <Field.Label for="into">Merge into <span class="text-destructive">*</span></Field.Label>
        <ProductPicker id="into" name="into_id" bind:value={intoId} allowEmpty={false} exclude={text(product.id)} emptyLabel="No other product." />
      </Field.Field>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="submit">Continue</Button>
        <Button variant="outline" href="/admin/products/{product.id}">Cancel</Button>
      </div>
    </Field.Group>
  </form>
</div>
