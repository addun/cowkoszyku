<script lang="ts">
  import { page } from '$app/state';
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { formatBoughtOn } from '$lib/format';
  import { resourceView, arr, obj, text } from '$lib/admin/view';
  import type { AdminReceiptsResponse } from '@cowkoszyku/contract/admin/receipts';

  const LIMIT = 40;

  let { data } = $props();
  const props = $derived({
    receipts: data.receipts,
  });

  const view = $derived(resourceView(props));
  const store = $derived(page.url.searchParams.get('store') ?? '');
  const listKey = $derived(store);

  let more = $state<AdminReceiptsResponse['receipts']>([]);
  let moreQuery = $state<string | null>(null);
  let moreFull = $state(true);
  let moreError = $state('');
  let loading = $state(false);

  const receipts = $derived.by(() => {
    const rows = moreQuery === listKey ? [...arr(view.receipts), ...more] : [...arr(view.receipts)];
    return rows.sort(byPurchaseDateDesc);
  });
  const hasMore = $derived(moreQuery === listKey ? moreFull && receipts.length > 0 : arr(view.receipts).length === LIMIT);

  $effect(() => {
    void listKey;
    moreError = '';
  });

  function byPurchaseDateDesc(a: unknown, b: unknown): number {
    const left = obj(a);
    const right = obj(b);
    const leftOn = text(left.boughtOn).trim();
    const rightOn = text(right.boughtOn).trim();
    if (leftOn !== rightOn) {
      if (leftOn === '') return 1;
      if (rightOn === '') return -1;
      return rightOn.localeCompare(leftOn);
    }
    return Number(right.id) - Number(left.id);
  }

  async function loadMore() {
    if (loading || !hasMore) return;
    const storeId = store;
    const key = storeId;
    const offset = receipts.length;
    loading = true;
    moreError = '';
    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(LIMIT),
      });
      if (storeId) params.set('store', storeId);
      const res = await fetch(`/api/admin/receipts?${params}`);
      if (key !== listKey) return;
      if (!res.ok) {
        moreError = 'Could not load receipts.';
        return;
      }
      const body = (await res.json()) as AdminReceiptsResponse;
      if (key !== listKey) return;
      const seen = new Set((moreQuery === key ? [...arr(view.receipts), ...more] : arr(view.receipts)).map((receipt) => text(obj(receipt).id)));
      const next = body.receipts.filter((receipt) => !seen.has(String(receipt.id)));
      more = moreQuery === key ? [...more, ...next] : next;
      moreQuery = key;
      moreFull = body.receipts.length === LIMIT;
    } catch {
      if (key !== listKey) return;
      moreError = 'API is unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Receipts · cowkoszyku</title></svelte:head>

<Notice message={data.error || moreError} />
<div class="flex flex-wrap items-center justify-between gap-3">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Receipts</h1>
    {#if store}
      <p class="text-muted-foreground text-sm">{data.storeName || 'Store'} · <a class="underline underline-offset-4" href="/admin/receipts">All receipts</a></p>
    {/if}
  </div>
  <div class="flex flex-wrap gap-2">
    <Button variant="outline" href="/admin/receipts/duplicates">Show duplicates</Button>
    <Button variant="outline" href="/admin/receipts/imports">Import</Button>
    <Button href="/admin/receipts/new">Add receipt</Button>
  </div>
</div>

{#if receipts.length === 0}
  <Empty.Root class="border">
    <Empty.Header>
      <Empty.Title>{store ? 'No receipts for this store.' : 'No receipts yet.'}</Empty.Title>
    </Empty.Header>
  </Empty.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Date</Table.Head>
        <Table.Head>Shop</Table.Head>
        <Table.Head>Status</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each receipts as receipt (text(obj(receipt).id))}
        {@const row = obj(receipt)}
        <Table.Row>
          <Table.Cell class="font-medium">
            <a class="hover:underline" href="/admin/receipts/{row.id}">{formatBoughtOn(text(row.displayDate))}</a>
          </Table.Cell>
          <Table.Cell>{row.shopName ? text(row.shopName) : '—'}</Table.Cell>
          <Table.Cell>{text(row.statusLabel)}</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
  {#if hasMore}
    <Button variant="outline" type="button" disabled={loading} onclick={loadMore}>
      {loading ? 'Loading…' : 'Load more'}
    </Button>
  {/if}
{/if}
