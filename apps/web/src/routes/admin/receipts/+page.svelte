<script lang="ts">
  import { page } from '$app/state';
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { formatBoughtOn } from '$lib/format';
  import { resourceView, arr, obj, text } from '$lib/admin/view';
  let { data } = $props();
  const props = $derived({
    receipts: data.receipts,
  });

  const view = $derived(resourceView(props));
  const store = $derived(page.url.searchParams.get('store') ?? '');
  const receipts = $derived(
    [...arr(view.receipts)].sort((a, b) => {
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
    }),
  );
</script>

<svelte:head><title>Receipts · cowkoszyku</title></svelte:head>

<Notice message={data.error} />
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
{/if}
