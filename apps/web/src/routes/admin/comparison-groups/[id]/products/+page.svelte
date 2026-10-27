<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { isHttpError } from '@sveltejs/kit';
  import { addComparisonGroupProducts, removeComparisonGroupProduct } from '$lib/api/admin/groups';
  import { listProducts } from '$lib/api/admin/products';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { formatPrice } from '$lib/format';
  import ProductTile from '$lib/ProductTile.svelte';
  import type { AdminProductResponse } from '@cowkoszyku/contract/admin/products';

  const LIMIT = 40;

  type Member = { id: number; name: string; image: string; now: string; priceNote: string };

  let { data } = $props();

  let members = $state<Member[]>(data.members.map((member) => ({ id: member.id, name: member.name, image: member.image, now: member.now, priceNote: member.priceNote })));
  let rows = $state<AdminProductResponse[]>([...data.products]);
  let seenGroup = $state(data.group.id);
  let q = $state('');
  let memberQuery = $state('');
  let offset = $state(data.products.length);
  let moreFull = $state(data.products.length === LIMIT);
  let loading = $state(false);
  let pendingId = $state(0);
  let error = $state('');
  let request = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const memberIds = $derived(new Set(members.map((member) => member.id)));
  const available = $derived(rows.filter((product) => !memberIds.has(product.id)));
  const visibleMembers = $derived.by(() => {
    const query = memberQuery.trim().toLocaleLowerCase();
    if (!query) return members;
    return members.filter((member) => member.name.toLocaleLowerCase().includes(query));
  });

  $effect(() => {
    if (data.group.id === seenGroup) return;
    seenGroup = data.group.id;
    members = data.members.map((member) => ({ id: member.id, name: member.name, image: member.image, now: member.now, priceNote: member.priceNote }));
    rows = [...data.products];
    q = '';
    memberQuery = '';
    offset = data.products.length;
    moreFull = data.products.length === LIMIT;
    error = '';
  });

  function onInput() {
    clearTimeout(timer);
    timer = setTimeout(() => void load(true), 200);
  }

  async function load(reset: boolean) {
    const query = q.trim();
    const nextOffset = reset ? 0 : offset;
    const token = ++request;
    loading = true;
    error = '';
    try {
      const body = await listProducts({ q: query, offset: nextOffset, limit: LIMIT });
      if (token !== request) return;
      const seen = new Set((reset ? [] : rows).map((product) => product.id));
      const incoming = body.products.filter((product) => !seen.has(product.id));
      rows = reset ? incoming : [...rows, ...incoming];
      offset = nextOffset + body.products.length;
      moreFull = body.products.length === LIMIT;
    } catch (err) {
      if (token !== request) return;
      error = isHttpError(err) && err.status !== 503 ? 'Could not load products.' : 'API is unavailable.';
    } finally {
      if (token === request) loading = false;
    }
  }

  function groupError(message: string): string {
    return message && message !== 'Request failed.' ? message : 'Could not update the group.';
  }

  async function add(product: AdminProductResponse) {
    if (pendingId || memberIds.has(product.id)) return;
    const member = {
      id: product.id,
      name: product.name,
      image: product.image,
      now: product.price ? formatPrice(product.price, product.compareValue, product.unitName, data.currency) : '',
      priceNote: product.priceNote,
    };
    members = [...members, member];
    pendingId = product.id;
    error = '';
    try {
      const result = await addComparisonGroupProducts(data.group.id, { product_id: [product.id] });
      if (!result.ok) {
        members = members.filter((item) => item.id !== product.id);
        error = groupError(result.message);
      }
    } catch {
      members = members.filter((item) => item.id !== product.id);
      error = 'API is unavailable.';
    } finally {
      pendingId = 0;
    }
  }

  async function remove(member: Member) {
    if (pendingId) return;
    members = members.filter((item) => item.id !== member.id);
    pendingId = member.id;
    error = '';
    try {
      const result = await removeComparisonGroupProduct(data.group.id, member.id);
      if (!result.ok) {
        members = [...members, member];
        error = groupError(result.message);
      }
    } catch {
      members = [...members, member];
      error = 'API is unavailable.';
    } finally {
      pendingId = 0;
    }
  }
</script>

<svelte:head><title>Group {data.group.name} · cowkoszyku</title></svelte:head>

<Notice message={error} />

<div class="flex flex-col gap-4">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Group {data.group.name}</h1>
    <p class="text-muted-foreground text-sm">Compare in {data.group.unitName}</p>
  </div>

  <div class="grid grid-cols-1 gap-4 lg:h-[32rem] lg:grid-cols-2">
    <section class="flex h-72 min-h-0 flex-col overflow-hidden rounded-xl border lg:h-full">
      <div class="flex flex-col gap-2 border-b px-3 py-2">
        <h2 class="text-sm font-medium">In group</h2>
        <label class="sr-only" for="member-q">Find in group</label>
        <Input
          id="member-q"
          type="search"
          class="w-full"
          placeholder="Find in group"
          autocomplete="off"
          bind:value={memberQuery}
        />
      </div>
      {#if members.length === 0}
        <p class="text-muted-foreground px-3 py-6 text-sm">No products in this group yet.</p>
      {:else if visibleMembers.length === 0}
        <p class="text-muted-foreground px-3 py-6 text-sm">No product matches “{memberQuery.trim()}”.</p>
      {:else}
        <ul class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
          {#each visibleMembers as member (member.id)}
            <li>
              <ProductTile href="/admin/products/{member.id}" card={member}>
                {#snippet actions()}
                  <Button type="button" variant="ghost" size="sm" disabled={pendingId === member.id} onclick={() => remove(member)}>
                    Remove
                  </Button>
                {/snippet}
              </ProductTile>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="flex h-96 min-h-0 flex-col overflow-hidden rounded-xl border lg:h-full">
      <div class="flex flex-col gap-2 border-b px-3 py-2">
        <h2 class="text-sm font-medium">Add new product</h2>
        <label class="sr-only" for="q">Find a product</label>
        <Input id="q" type="search" class="w-full" placeholder="Find a product" autocomplete="off" bind:value={q} oninput={onInput} />
      </div>
      <ul class="min-h-0 flex-1 overflow-auto">
        {#each available as product (product.id)}
          <li class="border-b last:border-b-0">
            <button
              type="button"
              class="hover:bg-muted flex w-full flex-col px-3 py-2 text-left disabled:opacity-50"
              disabled={pendingId === product.id}
              onclick={() => add(product)}
            >
              <span class="truncate font-medium">{product.name}</span>
              <span class="text-muted-foreground text-sm">{product.unitName}</span>
            </button>
          </li>
        {/each}
        {#if available.length === 0 && !loading}
          <li class="text-muted-foreground px-3 py-6 text-sm">
            {#if q.trim() && rows.length === 0}
              No product matches “{q.trim()}”.
            {:else if rows.length > 0}
              Already in this group.
            {:else}
              No products to add.
            {/if}
          </li>
        {:else if loading && available.length === 0}
          <li class="text-muted-foreground px-3 py-2 text-sm">Loading…</li>
        {/if}
        {#if moreFull}
          <li class="p-2">
            <Button type="button" variant="ghost" class="w-full" disabled={loading} onclick={() => load(false)}>
              {loading ? 'Loading…' : 'Load more'}
            </Button>
          </li>
        {/if}
      </ul>
    </section>
  </div>
</div>
