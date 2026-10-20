<script lang="ts">
  import { page } from '$app/state';
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { formatBoughtOn, formatPrice } from '$lib/format';
  import type { AdminProductResponse, AdminProductsResponse } from '../../../../../../../api/src/features/admin/products/contract/response';

  const LIMIT = 40;

  let { data, form } = $props();

  const q = $derived(page.url.searchParams.get('q') ?? '');

  let more = $state<AdminProductResponse[]>([]);
  let moreQuery = $state<string | null>(null);
  let moreFull = $state(true);
  let moreError = $state('');
  let loading = $state(false);
  let picked = $state<Record<string, boolean>>({});

  const products = $derived(moreQuery === q ? [...data.products, ...more] : data.products);
  const memberIds = $derived(new Set(data.members.map((member) => member.id)));
  const hasMore = $derived(moreQuery === q ? moreFull && products.length > 0 : data.products.length === LIMIT);
  const pickedCount = $derived(Object.values(picked).filter(Boolean).length);

  $effect(() => {
    void q;
    moreError = '';
    picked = {};
  });

  async function loadMore() {
    if (loading || !hasMore) return;
    const query = q;
    const offset = products.length;
    loading = true;
    moreError = '';
    try {
      const params = new URLSearchParams({
        q: query,
        offset: String(offset),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/products.json?${params}`);
      if (query !== q) return;
      if (!res.ok) {
        moreError = 'Could not load products.';
        return;
      }
      const body = (await res.json()) as AdminProductsResponse;
      if (query !== q) return;
      const seen = new Set((moreQuery === query ? [...data.products, ...more] : data.products).map((product) => product.id));
      const next = body.products.filter((product) => !seen.has(product.id));
      more = moreQuery === query ? [...more, ...next] : next;
      moreQuery = query;
      moreFull = body.products.length === LIMIT;
    } catch {
      if (query !== q) return;
      moreError = 'API is unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Add products · {data.group.name} · cowkoszyku</title></svelte:head>

<Notice message={form?.message || moreError} />

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Add products</h1>
      <p class="text-muted-foreground text-sm">{data.group.name} · {data.group.unitName} · {data.members.length} already in this group</p>
    </div>
    <Button variant="outline" href="/admin/comparison-groups/{data.group.id}/edit">Back</Button>
  </div>
  <form class="flex gap-2" method="get">
    <label class="sr-only" for="q">Search</label>
    <Input id="q" name="q" type="search" class="max-w-sm" value={q} placeholder="Find a product" autocomplete="off" />
    <Button type="submit">Search</Button>
  </form>
</div>

<form method="post" class="flex flex-col gap-4">
  {#if products.length === 0}
    <Empty.Root class="border">
      <Empty.Header>
        {#if q}
          <Empty.Title>No product matches “{q}”.</Empty.Title>
        {:else}
          <Empty.Title>Nothing on the list yet.</Empty.Title>
        {/if}
      </Empty.Header>
    </Empty.Root>
  {:else}
    <ul class="divide-y overflow-hidden rounded-xl border">
      {#each products as product (product.id)}
        {@const inGroup = memberIds.has(product.id)}
        <li class="flex items-center gap-3 px-3 py-2">
          {#if inGroup}
            <span class="text-muted-foreground w-16 shrink-0 text-sm">In group</span>
          {:else}
            <Checkbox
              id="product-{product.id}"
              name="product_id"
              value={String(product.id)}
              checked={picked[String(product.id)] === true}
              onCheckedChange={(next) => {
                picked[String(product.id)] = next === true;
              }}
            />
          {/if}
          <label class="flex min-w-0 flex-1 items-center gap-3" for={inGroup ? undefined : `product-${product.id}`}>
            {#if product.image}
              <img class="size-10 rounded-md object-cover" src={product.image} alt="" />
            {:else}
              <span class="bg-muted size-10 shrink-0 rounded-md" aria-hidden="true"></span>
            {/if}
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium">{product.name}</span>
              <span class="text-muted-foreground block text-sm">{product.unitName}{product.lastBought ? ` · last ${formatBoughtOn(product.lastBought)}` : ''}</span>
            </span>
            <span class="text-sm tabular-nums">{product.price ? formatPrice(product.price, product.compareValue, product.unitName, data.currency) : '—'}</span>
          </label>
        </li>
      {/each}
    </ul>
    {#if hasMore}
      <Button variant="outline" type="button" disabled={loading} onclick={loadMore}>
        {loading ? 'Loading…' : 'Load more'}
      </Button>
    {/if}
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <Button type="submit">Save{pickedCount > 0 ? ` (${pickedCount})` : ''}</Button>
    <Button variant="outline" href="/admin/comparison-groups/{data.group.id}/edit">Cancel</Button>
  </div>
</form>
