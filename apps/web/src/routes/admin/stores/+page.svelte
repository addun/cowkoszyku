<script lang="ts">
  import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { resourceView, arr, countLabel, obj, text } from '$lib/admin/view';
  import type { AdminStoreResponse, AdminStoresResponse } from '@cowkoszyku/contract/admin/locations';

  const LIMIT = 40;

  let { data } = $props();
  const props = $derived({
    stores: data.stores,
  });

  const view = $derived(resourceView(props));

  let more = $state<AdminStoreResponse[]>([]);
  let moreLoaded = $state(false);
  let moreFull = $state(true);
  let moreError = $state('');
  let loading = $state(false);

  const stores = $derived(moreLoaded ? [...arr(view.stores), ...more] : arr(view.stores));
  const hasMore = $derived(moreLoaded ? moreFull && stores.length > 0 : arr(view.stores).length === LIMIT);

  $effect(() => {
    void data.stores;
    more = [];
    moreLoaded = false;
    moreFull = true;
    moreError = '';
  });

  async function loadMore() {
    if (loading || !hasMore) return;
    const offset = stores.length;
    loading = true;
    moreError = '';
    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/stores?${params}`);
      if (!res.ok) {
        moreError = 'Could not load stores.';
        return;
      }
      const body = (await res.json()) as AdminStoresResponse;
      const seen = new Set(stores.map((store) => text(obj(store).id)));
      const next = body.stores.filter((store) => !seen.has(String(store.id)));
      more = [...more, ...next];
      moreLoaded = true;
      moreFull = body.stores.length === LIMIT;
    } catch {
      moreError = 'API is unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Stores · cowkoszyku</title></svelte:head>

<Notice message={data.error || moreError} />
<div class="flex flex-wrap items-center justify-between gap-3">
  <h1 class="text-2xl font-semibold tracking-tight">Stores</h1>
  <Button href="/admin/stores/new">Add store</Button>
</div>

{#if stores.length === 0}
  <Empty.Root class="border">
    <Empty.Header>
      <Empty.Title>No stores yet.</Empty.Title>
    </Empty.Header>
  </Empty.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Parent</Table.Head>
        <Table.Head>Address</Table.Head>
        <Table.Head>Purchases</Table.Head>
        <Table.Head class="text-right">Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each stores as store (text(obj(store).id))}
        {@const row = obj(store)}
        <Table.Row>
          <Table.Cell>{row.retailChainName ? text(row.retailChainName) : '—'}</Table.Cell>
          <Table.Cell>{text(row.addressLine)}</Table.Cell>
          <Table.Cell>
            {#if Number(row.purchaseCount) > 0}
              <a class="hover:underline" href="/admin/receipts?store={row.id}">{countLabel(Number(row.purchaseCount), 'purchase', 'purchases')}</a>
            {:else}
              {countLabel(0, 'purchase', 'purchases')}
            {/if}
          </Table.Cell>
          <Table.Cell class="text-right">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Button {...props} variant="ghost" size="icon-sm" aria-label="Actions">
                    <EllipsisVerticalIcon />
                  </Button>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" class="min-w-36">
                <DropdownMenu.Item>
                  {#snippet child({ props })}
                    <a {...props} href="/admin/stores/{row.id}/edit">Edit</a>
                  {/snippet}
                </DropdownMenu.Item>
                <DropdownMenu.Item>
                  {#snippet child({ props })}
                    <a {...props} href="/admin/stores/{row.id}/merge-with">Merge</a>
                  {/snippet}
                </DropdownMenu.Item>
                {#if !row.purchaseCount}
                  <DropdownMenu.Item variant="destructive">
                    {#snippet child({ props })}
                      <a {...props} href="/admin/stores/{row.id}/delete">Delete</a>
                    {/snippet}
                  </DropdownMenu.Item>
                {/if}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Table.Cell>
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
