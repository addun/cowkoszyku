<script lang="ts">
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { receiptPreviewPath } from '$lib/api/admin/receipts';
  import { formatBoughtOn, formatMoneyAmount, formatQty } from '$lib/format';
  import ProductTile from '$lib/ProductTile.svelte';
  import { resourceView, arr, num, obj, text } from '$lib/admin/view';

  let props = $props();
  const view = $derived(resourceView(props));
  const receipt = $derived(obj(view.receipt));
  const store = $derived(obj(view.store));
  const purchases = $derived(arr(view.purchases));
  const imported = $derived(num(view.imported));
  const symbol = $derived(text(view.page.symbol));
</script>

<h1 class="text-2xl font-semibold tracking-tight">Receipt</h1>

{#if imported > 0}
  <Alert.Root>
    <Alert.Description>Saved {imported} purchase{imported === 1 ? '' : 's'} from the bill.</Alert.Description>
  </Alert.Root>
{/if}
{#if view.notes}
  <Alert.Root>
    <Alert.Description>{text(view.notes)}</Alert.Description>
  </Alert.Root>
{/if}

<div class={receipt.imagePath ? 'grid items-start gap-6 lg:grid-cols-[16rem_1fr]' : 'flex flex-col gap-6'}>
  {#if receipt.imagePath}
    <img class="w-full rounded-xl border" src={receiptPreviewPath(text(receipt.id))} alt="Uploaded bill" />
  {/if}

  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-1">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold tracking-tight">Visit</h2>
        <Button variant="outline" size="sm" href="/admin/receipts/{receipt.id}/edit">Edit</Button>
      </div>
      <p class="text-muted-foreground text-sm">
        {view.boughtOn ? formatBoughtOn(text(view.boughtOn)) : 'No date'}
        {num(store.id) ? ` · ${text(store.name)}` : ' · No store'}
      </p>
    </section>

    <h2 class="text-lg font-semibold tracking-tight">Products</h2>
    {#if purchases.length === 0}
      <Empty.Root class="border">
        <Empty.Header>
          <Empty.Title>No purchases left on this bill.</Empty.Title>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <ul class="grid gap-3">
        {#each purchases as purchase (text(obj(purchase).id))}
          {@const row = obj(purchase)}
          <li>
            <ProductTile
              href="/admin/products/{row.productId}"
              card={{
                name: text(row.productName),
                image: row.imagePath ? `/images/${text(row.imagePath)}` : '',
                now: formatMoneyAmount(text(row.amount), symbol),
                priceNote: `${formatQty(text(row.quantity))} ${text(row.unitName)}`.trim(),
              }}
            >
              {#snippet actions()}
                <Button variant="ghost" size="sm" href="/admin/purchases/{row.id}/edit">Edit</Button>
                <Button variant="ghost" size="sm" class="text-destructive" href="/admin/purchases/{row.id}/delete">Delete</Button>
              {/snippet}
            </ProductTile>
          </li>
        {/each}
      </ul>
    {/if}

    <Button variant="destructive" class="w-fit" href="/admin/receipts/{receipt.id}/delete">Delete receipt</Button>
  </div>
</div>
