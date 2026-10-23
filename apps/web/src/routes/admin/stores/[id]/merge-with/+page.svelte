<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import StorePicker from '$lib/admin/StorePicker.svelte';
  import { resourceView, num, obj, text } from '$lib/admin/view';
  let { data, form } = $props();
  const props = $derived({
    store: data.store,
  });

  const view = $derived(resourceView(props));
  const store = $derived(obj(view.store));
  let intoId = $state(num(form?.intoId) ? text(form?.intoId) : '');
</script>

<svelte:head><title>Merge store · cowkoszyku</title></svelte:head>

<Notice message={form?.message} />
<div class="flex max-w-xl flex-col gap-4">
  <h1 class="text-2xl font-semibold tracking-tight">Merge {text(store.name)}?</h1>
  <p class="text-muted-foreground">Pick the store to keep. You will see a summary before anything is removed.</p>
  <form method="post" action="/admin/stores/{store.id}/merge-with">
    <Field.Group>
      <Field.Field>
        <Field.Label for="into">Merge into <span class="text-destructive">*</span></Field.Label>
        <StorePicker id="into" name="into_id" bind:value={intoId} allowEmpty={false} exclude={text(store.id)} emptyLabel="No other store." />
      </Field.Field>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="submit">Continue</Button>
        <Button variant="outline" href="/admin/stores">Cancel</Button>
      </div>
    </Field.Group>
  </form>
</div>
