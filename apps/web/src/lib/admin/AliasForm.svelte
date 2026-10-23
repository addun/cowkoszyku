<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as NativeSelect from '$lib/components/ui/native-select/index.js';
  import ProductPicker from '$lib/admin/ProductPicker.svelte';
  import StorePicker from '$lib/admin/StorePicker.svelte';
  import { resourceView, arr, flag, num, obj, text } from '$lib/admin/view';

  let props = $props();
  const view = $derived(resourceView(props));
  const isNew = $derived(flag(view['new']));
  const alias = $derived(obj(view.alias));
  const locked = $derived(obj(view.lockedProduct));
  const hasLocked = $derived(isNew && num(locked.id) > 0);
  const chains = $derived(arr(view.chains));
  const action = $derived(isNew ? '/admin/aliases/new' : `/admin/aliases/${text(alias.id)}/edit`);
  const initialScope = text(alias.scopeValue);
  let chainScope = $state(initialScope.startsWith('chain:') ? initialScope : '');
  let storeId = $state(initialScope.startsWith('store:') ? initialScope.slice('store:'.length) : '');
  let productId = $state(num(alias.productId) ? text(alias.productId) : '');

  $effect(() => {
    if (storeId) chainScope = '';
  });
</script>

<h1 class="text-2xl font-semibold tracking-tight">{isNew ? 'Add alias' : 'Edit alias'}</h1>
<form method="post" {action}>
  <Field.Group class="max-w-xl">
    {#if num(view.fromProduct) > 0}<input type="hidden" name="from_product" value={text(view.fromProduct)} />{/if}
    <Field.Set>
      <Field.Legend>For</Field.Legend>
      {#if hasLocked}
        <input type="hidden" name="product_id" value={text(alias.productId)} />
        <p class="text-sm">Product {text(locked.name)}</p>
      {:else}
        <Field.Field>
          <Field.Label for="product">Product <span class="text-destructive">*</span></Field.Label>
          <ProductPicker id="product" bind:value={productId} allowEmpty={false} label={productId ? text(alias.productName) : ''} />
        </Field.Field>
      {/if}
      <Field.Field>
        <Field.Label for="scope">Scope</Field.Label>
        <input type="hidden" name="scope" value={storeId ? `store:${storeId}` : chainScope} />
        <NativeSelect.Root
          id="scope"
          class="w-full"
          bind:value={chainScope}
          onchange={(event) => {
            const next = event.currentTarget instanceof HTMLSelectElement ? event.currentTarget.value : '';
            if (next.startsWith('chain:')) storeId = '';
          }}
        >
          <NativeSelect.Option value="">Any shop</NativeSelect.Option>
          {#if chains.length > 0}
            <NativeSelect.OptGroup label="Retail chains">
              {#each chains as chain (text(obj(chain).id))}
                {@const row = obj(chain)}
                <NativeSelect.Option value="chain:{row.id}">{text(row.name)}</NativeSelect.Option>
              {/each}
            </NativeSelect.OptGroup>
          {/if}
        </NativeSelect.Root>
      </Field.Field>
      <Field.Field>
        <Field.Label for="store">Store</Field.Label>
        <StorePicker id="store" name="" bind:value={storeId} label={storeId ? text(alias.storeName) : ''} />
      </Field.Field>
    </Field.Set>
    <Field.Set>
      <Field.Legend>Name on the bill</Field.Legend>
      <Field.Field>
        <Field.Label for="alias">Alias <span class="text-destructive">*</span></Field.Label>
        <Input id="alias" name="alias" required value={text(alias.alias)} autofocus />
      </Field.Field>
    </Field.Set>
    <div class="flex flex-wrap items-center gap-2">
      <Button type="submit">{isNew ? 'Add alias' : 'Save alias'}</Button>
      <Button variant="outline" href={text(view.cancel) || '/admin/aliases'}>Cancel</Button>
    </div>
  </Field.Group>
</form>
