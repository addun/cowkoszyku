<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as NativeSelect from '$lib/components/ui/native-select/index.js';
  import { resourceView, arr, flag, obj, text } from '$lib/admin/view';

  let props = $props();
  const view = $derived(resourceView(props));
  const isNew = $derived(flag(view['new']));
  const group = $derived(obj(view.group));
  const units = $derived(arr(view.units));
  const products = $derived(arr(view.products));
  const action = $derived(isNew ? '/admin/comparison-groups/new' : '?/save');
</script>

<h1 class="text-2xl font-semibold tracking-tight">{isNew ? 'Add comparison group' : 'Edit comparison group'}</h1>
<form method="post" {action}>
  <Field.Group class="max-w-xl">
    <Field.Set>
      <Field.Legend>Group</Field.Legend>
      <Field.Field>
        <Field.Label for="name">Name <span class="text-destructive">*</span></Field.Label>
        <Input id="name" name="name" required value={text(group.name)} autofocus />
      </Field.Field>
      <Field.Field>
        <Field.Label for="unit">Compare in <span class="text-destructive">*</span></Field.Label>
        <NativeSelect.Root id="unit" class="w-full" name="unit_id" required value={text(group.unitId)}>
          <NativeSelect.Option value="">Select…</NativeSelect.Option>
          {#each units as unit (text(obj(unit).id))}
            {@const row = obj(unit)}
            <NativeSelect.Option value={text(row.id)}>{text(row.name)}</NativeSelect.Option>
          {/each}
        </NativeSelect.Root>
        <Field.Description>Members need this as their purchase unit, or a conversion to it. Rankings use the latest logged price per kg, litre, or whichever unit you pick.</Field.Description>
      </Field.Field>
    </Field.Set>

    <div class="flex flex-wrap items-center gap-2">
      <Button type="submit">{isNew ? 'Add group' : 'Save group'}</Button>
      <Button variant="outline" href="/admin/comparison-groups">Cancel</Button>
    </div>
  </Field.Group>
</form>

{#if !isNew}
  <section class="mt-8 flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold tracking-tight">Products</h2>
      <Button href="/admin/comparison-groups/{group.id}/products">Add products</Button>
    </div>
    {#if products.length === 0}
      <Empty.Root class="border">
        <Empty.Header>
          <Empty.Title>No products in this group yet.</Empty.Title>
          <Empty.Description>Add products from the catalog. The list is searched, so you don’t have to scroll the whole catalog.</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <ul class="divide-y overflow-hidden rounded-xl border">
        {#each products as product (text(obj(product).id))}
          {@const row = obj(product)}
          <li class="flex items-center gap-3 px-3 py-2">
            <a class="min-w-0 flex-1 hover:underline" href="/admin/products/{row.id}">
              <span class="block truncate font-medium">{text(row.name)}</span>
              <span class="text-muted-foreground block text-sm">{text(row.unitName)}</span>
            </a>
            <form method="post" action="?/remove">
              <input type="hidden" name="product_id" value={text(row.id)} />
              <Button type="submit" variant="ghost" size="sm">Remove</Button>
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}
