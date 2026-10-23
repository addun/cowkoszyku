<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import type { AdminProductResponse, AdminProductsResponse } from '@cowkoszyku/contract/admin/products';

  const LIMIT = 40;

  type Member = { id: number; name: string; unitName: string };

  let { data } = $props();

  let members = $state<Member[]>(data.members.map((member) => ({ id: member.id, name: member.name, unitName: member.unitName })));
  let rows = $state<AdminProductResponse[]>([...data.products]);
  let seenGroup = $state(data.group.id);
  let q = $state('');
  let offset = $state(data.products.length);
  let moreFull = $state(data.products.length === LIMIT);
  let loading = $state(false);
  let pendingId = $state(0);
  let error = $state('');
  let request = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const memberIds = $derived(new Set(members.map((member) => member.id)));
  const available = $derived(rows.filter((product) => !memberIds.has(product.id)));

  $effect(() => {
    if (data.group.id === seenGroup) return;
    seenGroup = data.group.id;
    members = data.members.map((member) => ({ id: member.id, name: member.name, unitName: member.unitName }));
    rows = [...data.products];
    q = '';
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
      const params = new URLSearchParams({
        q: query,
        offset: String(nextOffset),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/products.json?${params}`);
      if (token !== request) return;
      if (!res.ok) {
        error = 'Could not load products.';
        return;
      }
      const body = (await res.json()) as AdminProductsResponse;
      if (token !== request) return;
      const seen = new Set((reset ? [] : rows).map((product) => product.id));
      const incoming = body.products.filter((product) => !seen.has(product.id));
      rows = reset ? incoming : [...rows, ...incoming];
      offset = nextOffset + body.products.length;
      moreFull = body.products.length === LIMIT;
    } catch {
      if (token === request) error = 'API is unavailable.';
    } finally {
      if (token === request) loading = false;
    }
  }

  async function failure(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) return body.message;
    } catch {
      /* ignore */
    }
    return 'Could not update the group.';
  }

  async function add(product: AdminProductResponse) {
    if (pendingId || memberIds.has(product.id)) return;
    const member = { id: product.id, name: product.name, unitName: product.unitName };
    members = [...members, member];
    pendingId = product.id;
    error = '';
    try {
      const res = await fetch(`/api/admin/comparison-groups/${data.group.id}/products`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product_id: [product.id] }),
      });
      if (!res.ok) {
        members = members.filter((item) => item.id !== product.id);
        error = await failure(res);
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
      const res = await fetch(`/api/admin/comparison-groups/${data.group.id}/products/${member.id}`, { method: 'DELETE' });
      if (!res.ok) {
        members = [...members, member];
        error = await failure(res);
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
      <h2 class="border-b px-3 py-2 text-sm font-medium">In group</h2>
      {#if members.length === 0}
        <p class="text-muted-foreground px-3 py-6 text-sm">No products in this group yet.</p>
      {:else}
        <ul class="min-h-0 flex-1 divide-y overflow-auto">
          {#each members as member (member.id)}
            <li class="flex items-center gap-2 px-3 py-2">
              <span class="min-w-0 flex-1">
                <span class="block truncate font-medium">{member.name}</span>
                <span class="text-muted-foreground block text-sm">{member.unitName}</span>
              </span>
              <Button type="button" variant="ghost" size="sm" disabled={pendingId === member.id} onclick={() => remove(member)}>
                Remove
              </Button>
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
