<script lang="ts">
  import { page } from '$app/state';
  import { queryParams, queryValue } from '$lib/common/http';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { isHttpError } from '@sveltejs/kit';
  import { listProducts } from '$lib/api/admin/products';
  import { formatPrice } from '$lib/format';
  import ProductTile from '$lib/ProductTile.svelte';
  import type { AdminProductResponse } from '@cowkoszyku/contract/admin/products';

  const LIMIT = 40;

  let { data } = $props();

  const query = $derived(queryParams(page.url));
  const q = $derived(queryValue(query, 'q'));
  const unit = $derived(queryValue(query, 'unit'));
  const listKey = $derived(`${q}\n${unit}`);
  const imported = $derived(Number.parseInt(queryValue(query, 'imported'), 10) || 0);
  const error = $derived(queryValue(query, 'error'));

  let more = $state<AdminProductResponse[]>([]);
  let moreQuery = $state<string | null>(null);
  let moreFull = $state(true);
  let moreError = $state('');
  let loading = $state(false);

  const products = $derived(moreQuery === listKey ? [...data.products, ...more] : data.products);
  const loadError = $derived(moreError || data.loadError);
  const hasMore = $derived(moreQuery === listKey ? moreFull && products.length > 0 : data.products.length === LIMIT);

  $effect(() => {
    void listKey;
    moreError = '';
  });

  async function loadMore() {
    if (loading || !hasMore) return;
    const query = q;
    const unitId = unit;
    const key = `${query}\n${unitId}`;
    const offset = products.length;
    loading = true;
    moreError = '';
    try {
      const body = await listProducts({ q: query, offset, limit: LIMIT, unit: unitId });
      if (key !== listKey) return;
      const seen = new Set((moreQuery === key ? [...data.products, ...more] : data.products).map((product) => product.id));
      const next = body.products.filter((product) => !seen.has(product.id));
      more = moreQuery === key ? [...more, ...next] : next;
      moreQuery = key;
      moreFull = body.products.length === LIMIT;
    } catch (err) {
      if (key !== listKey) return;
      moreError = isHttpError(err) && err.status !== 503 ? 'Could not load products.' : 'API is unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Products · cowkoszyku</title>
</svelte:head>

{#if error}
  <Alert.Root variant="destructive">
    <Alert.Description>{error}</Alert.Description>
  </Alert.Root>
{/if}
{#if imported > 0}
  <Alert.Root>
    <Alert.Description>Saved {imported} purchase{imported === 1 ? '' : 's'} from the bill.</Alert.Description>
  </Alert.Root>
{/if}
{#if loadError}
  <Alert.Root variant="destructive">
    <Alert.Description>{loadError}</Alert.Description>
  </Alert.Root>
{/if}

<div class="flex flex-col gap-4">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Products</h1>
    {#if data.unitName}
      <p class="text-muted-foreground text-sm">{data.unitName} · <a class="underline underline-offset-4" href="/admin/products">All products</a></p>
    {/if}
  </div>
  <form class="flex gap-2" method="get" action="/admin">
    <label class="sr-only" for="q">Search</label>
    {#if unit}<input type="hidden" name="unit" value={unit} />{/if}
    <Input id="q" name="q" type="search" class="w-full flex-1" value={q} placeholder="Find a product" autocomplete="off" />
    <Button type="submit">Search</Button>
  </form>
</div>

{#if products.length === 0}
  {#if !loadError}
    <Empty.Root class="border">
      <Empty.Header>
        {#if q}
          <Empty.Title>No product matches “{q}”.</Empty.Title>
        {:else if unit}
          <Empty.Title>No products use this unit.</Empty.Title>
        {:else}
          <Empty.Title>Nothing on the list yet.</Empty.Title>
          <Empty.Description>
            <a href="/admin/products/new">Add the first product you buy in bulk</a>, or <a href="/admin/receipts/new">scan a bill</a>.
          </Empty.Description>
        {/if}
      </Empty.Header>
    </Empty.Root>
  {/if}
{:else}
  <ul class="grid gap-3">
    {#each products as product (product.id)}
      <li>
        <ProductTile
          href="/admin/products/{product.id}"
          card={{
            name: product.name,
            image: product.image,
            now: product.price ? formatPrice(product.price, product.compareValue, product.unitName, data.currency) : '',
            priceNote: product.priceNote,
          }}
        />
      </li>
    {/each}
  </ul>
  {#if hasMore}
    <Button variant="outline" type="button" disabled={loading} onclick={loadMore}>
      {loading ? 'Loading…' : 'Load more'}
    </Button>
  {/if}
{/if}
