<script lang="ts">
  import { page } from '$app/state';
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { resourceView, arr, obj, text } from '$lib/admin/view';
  import type { AdminAliasResponse, AdminAliasesResponse } from '@cowkoszyku/contract/admin/aliases';

  const LIMIT = 40;

  let { data } = $props();
  const props = $derived({
    aliases: data.aliases,
    filter: data.filter,
    productQuery: data.productQuery,
  });

  const view = $derived(resourceView(props));
  const filter = $derived(view.filter ? obj(view.filter) : null);
  const productQuery = $derived(text(view.productQuery));
  const q = $derived(page.url.searchParams.get('q') ?? '');
  const product = $derived(page.url.searchParams.get('product') ?? '');
  const listKey = $derived(`${q}\n${product}`);

  let more = $state<AdminAliasResponse[]>([]);
  let moreQuery = $state<string | null>(null);
  let moreFull = $state(true);
  let moreError = $state('');
  let loading = $state(false);

  const aliases = $derived(moreQuery === listKey ? [...arr(view.aliases), ...more] : arr(view.aliases));
  const hasMore = $derived(moreQuery === listKey ? moreFull && aliases.length > 0 : arr(view.aliases).length === LIMIT);

  $effect(() => {
    void listKey;
    moreError = '';
  });

  async function loadMore() {
    if (loading || !hasMore) return;
    const query = q;
    const productId = product;
    const key = `${query}\n${productId}`;
    const offset = aliases.length;
    loading = true;
    moreError = '';
    try {
      const params = new URLSearchParams({
        q: query,
        offset: String(offset),
        limit: String(LIMIT),
      });
      if (productId) params.set('product', productId);
      const res = await fetch(`/api/admin/aliases?${params}`);
      if (key !== listKey) return;
      if (!res.ok) {
        moreError = 'Could not load aliases.';
        return;
      }
      const body = (await res.json()) as AdminAliasesResponse;
      if (key !== listKey) return;
      const seen = new Set((moreQuery === key ? [...arr(view.aliases), ...more] : arr(view.aliases)).map((alias) => text(obj(alias).id)));
      const next = body.aliases.filter((alias) => !seen.has(String(alias.id)));
      more = moreQuery === key ? [...more, ...next] : next;
      moreQuery = key;
      moreFull = body.aliases.length === LIMIT;
    } catch {
      if (key !== listKey) return;
      moreError = 'API is unavailable.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Aliases · cowkoszyku</title></svelte:head>

<Notice message={data.error || moreError} />
<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-start justify-between gap-3">
    {#if filter}
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold tracking-tight">Aliases for {text(filter.name)}</h1>
        <Button variant="link" class="h-auto px-0" href="/admin/aliases">All aliases</Button>
      </div>
      <Button href="/admin/aliases/new?product={filter.id}">Add alias</Button>
    {:else}
      <h1 class="text-2xl font-semibold tracking-tight">Aliases</h1>
      <Button href="/admin/aliases/new">Add alias</Button>
    {/if}
  </div>
  <form class="flex gap-2" method="get" action="/admin/aliases">
    <label class="sr-only" for="q">Search</label>
    {#if product}<input type="hidden" name="product" value={product} />{/if}
    <Input id="q" name="q" type="search" class="w-full flex-1" value={q} placeholder="Find an alias" autocomplete="off" />
    <Button type="submit">Search</Button>
  </form>
</div>

{#if aliases.length === 0}
  <Empty.Root class="border">
    <Empty.Header>
      {#if q}
        <Empty.Title>No alias matches “{q}”.</Empty.Title>
      {:else}
        <Empty.Title>{filter ? 'No aliases for this product.' : 'No aliases yet.'}</Empty.Title>
      {/if}
    </Empty.Header>
  </Empty.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Alias</Table.Head>
        <Table.Head>Product</Table.Head>
        <Table.Head>Scope</Table.Head>
        <Table.Head class="text-right">Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each aliases as alias (text(obj(alias).id))}
        {@const row = obj(alias)}
        <Table.Row>
          <Table.Cell class="font-medium">{text(row.alias)}</Table.Cell>
          <Table.Cell><a class="hover:underline" href="/admin/products/{row.productId}">{text(row.productName)}</a></Table.Cell>
          <Table.Cell>{text(row.scopeLabel)}</Table.Cell>
          <Table.Cell class="text-right">
            <Button variant="ghost" size="sm" href="/admin/aliases/{row.id}/edit{productQuery}">Edit</Button>
            <Button variant="ghost" size="sm" class="text-destructive" href="/admin/aliases/{row.id}/delete{productQuery}">Delete</Button>
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
