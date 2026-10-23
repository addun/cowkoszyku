<script lang="ts">
  import QtyTotal from '$lib/admin/QtyTotal.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import StorePicker from '$lib/admin/StorePicker.svelte';
  import { formatQty, isZeroQty, toDatetimeLocal } from '$lib/format';
  import { resourceView, arr, flag, obj, text } from '$lib/admin/view';

  let props = $props();
  const view = $derived(resourceView(props));
  const isNew = $derived(flag(view['new']));
  const product = $derived(obj(view.product));
  const purchase = $derived(obj(view.purchase));
  const stores = $derived(arr(view.stores).map(obj));
  const isPrice = $derived(purchase.isPrice === true);
  const action = $derived(isNew ? `/admin/products/${text(product.id)}/purchases/new` : `/admin/purchases/${text(purchase.id)}/edit`);
  const symbol = $derived(text(view.page.symbol));
  const currency = $derived(text(view.page.currency));

  const initial = obj(view.purchase);
  let quantity = $state(isZeroQty(initial.quantity) ? '' : formatQty(text(initial.quantity)));
  let amount = $state(isZeroQty(initial.amount) ? '' : text(initial.amount));
  let boughtOn = $state(toDatetimeLocal(text(initial.boughtOn)));
  let storeId = $state(text(initial.storeId));
  const selectedStore = $derived(stores.find((store) => text(store.id) === storeId));
  let kind = $state(text(initial.kind) || 'purchase');
</script>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">{isNew ? 'Add new purchase' : isPrice ? 'Edit price' : 'Edit purchase'}</h1>
  <p class="text-muted-foreground">{text(product.name)}</p>
</div>
<form method="post" {action}>
  <Field.Group class="max-w-xl">
    {#if !isNew && purchase.receiptId}
      <p class="text-sm">From <a class="underline underline-offset-4" href="/admin/receipts/{purchase.receiptId}">receipt {purchase.receiptId}</a></p>
    {/if}

    {#if isNew}
      <input type="hidden" name="bought_on" value={boughtOn} />
      <input type="hidden" name="quantity" value="1" />
    {:else}
      <Field.Set>
        <Field.Legend>When</Field.Legend>
        <Field.Field>
          <Field.Label for="bought-on">Date and hour <span class="text-destructive">*</span></Field.Label>
          <Input id="bought-on" type="datetime-local" name="bought_on" required bind:value={boughtOn} />
        </Field.Field>
      </Field.Set>

      <Field.Set>
        <Field.Legend>Quantity</Field.Legend>
        <Field.Field>
          <Field.Label for="quantity">Quantity ({text(product.unitName)}) <span class="text-destructive">*</span></Field.Label>
          <Input id="quantity" name="quantity" required inputmode="decimal" bind:value={quantity} />
          <QtyTotal {quantity} {amount} unit={text(product.unitName)} compare={text(product.compareValue)} {symbol} />
        </Field.Field>
      </Field.Set>
    {/if}

    <Field.Set>
      {#if !isNew}
        <Field.Legend>Paid</Field.Legend>
      {/if}
      <Field.Field>
        <Field.Label for="amount">Amount ({currency}) <span class="text-destructive">*</span></Field.Label>
        <Input id="amount" name="amount" required inputmode="decimal" bind:value={amount} />
      </Field.Field>
      <Field.Field>
        <Field.Label for="store">Store</Field.Label>
        <StorePicker id="store" bind:value={storeId} label={selectedStore ? text(selectedStore.label) : ''} />
      </Field.Field>
    </Field.Set>

    {#if isNew}
      <div class="flex flex-wrap items-center gap-2">
        <Button type="submit" name="kind" value="purchase">Save purchase</Button>
        <Button type="submit" variant="outline" name="kind" value="price">Log price</Button>
        <Button variant="ghost" href="/admin/products/{product.id}">Cancel</Button>
      </div>
    {:else}
      <Field.Set>
        <Field.Legend>Kind</Field.Legend>
        <RadioGroup.Root name="kind" bind:value={kind} class="gap-3">
          <div class="flex items-center gap-2">
            <RadioGroup.Item value="purchase" id="kind-purchase" />
            <Label for="kind-purchase">Purchase</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroup.Item value="price" id="kind-price" />
            <Label for="kind-price">Price only</Label>
          </div>
        </RadioGroup.Root>
      </Field.Set>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="submit">Save</Button>
        <Button variant="outline" href="/admin/products/{product.id}">Cancel</Button>
      </div>
    {/if}
  </Field.Group>
</form>
