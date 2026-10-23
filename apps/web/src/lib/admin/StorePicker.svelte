<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import type { AdminStoreResponse, AdminStoresResponse } from '@cowkoszyku/contract/admin/locations';

  const LIMIT = 20;

  let {
    name = 'store_id',
    id,
    value = $bindable(''),
    label = '',
    placeholder = 'Find a store',
    allowEmpty = true,
    exclude = '',
    emptyLabel = 'No stores yet.',
  }: {
    name?: string;
    id?: string;
    value?: string;
    label?: string;
    placeholder?: string;
    allowEmpty?: boolean;
    exclude?: string;
    emptyLabel?: string;
  } = $props();

  let q = $state('');
  let open = $state(false);
  let rows = $state<AdminStoreResponse[]>([]);
  let offset = $state(0);
  let more = $state(false);
  let loading = $state(false);
  let error = $state('');
  let picked = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request = 0;

  const shown = $derived(value ? picked || label || `Store ${value}` : '');

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
      const res = await fetch(`/api/admin/stores?${params}`);
      if (token !== request) return;
      if (!res.ok) {
        error = 'Could not load stores.';
        return;
      }
      const body = (await res.json()) as AdminStoresResponse;
      if (token !== request) return;
      const skip = String(exclude);
      const incoming = skip ? body.stores.filter((store) => String(store.id) !== skip) : body.stores;
      rows = reset ? incoming : [...rows, ...incoming];
      offset = nextOffset + body.stores.length;
      more = body.stores.length === LIMIT;
    } catch {
      if (token === request) error = 'API is unavailable.';
    } finally {
      if (token === request) loading = false;
    }
  }

  function resetResults() {
    rows = [];
    offset = 0;
    more = false;
    error = '';
  }

  function onFocus() {
    open = true;
    if (rows.length === 0 && !loading && offset === 0) void load(true);
  }

  function onInput() {
    open = true;
    clearTimeout(timer);
    timer = setTimeout(() => void load(true), 200);
  }

  function pick(store: AdminStoreResponse) {
    value = String(store.id);
    picked = store.label;
    q = '';
    open = false;
    resetResults();
  }

  function clear() {
    value = '';
    picked = '';
    q = '';
    open = false;
    resetResults();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') event.preventDefault();
    if (event.key === 'Escape') open = false;
  }

  function onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget;
    const current = event.currentTarget;
    if (next instanceof Node && current instanceof Node && current.contains(next)) return;
    open = false;
  }
</script>

<div class="flex flex-col gap-2" onfocusout={onFocusOut}>
  {#if name}<input type="hidden" {name} {value} />{/if}
  {#if shown}
    <div class="flex items-center justify-between gap-2 text-sm">
      <span>{shown}</span>
      {#if allowEmpty}
        <Button type="button" variant="ghost" size="sm" onclick={clear}>Clear</Button>
      {/if}
    </div>
  {/if}
  <Input {id} {placeholder} autocomplete="off" bind:value={q} onfocus={onFocus} oninput={onInput} onkeydown={onKeydown} />
  {#if open}
    <div class="flex max-h-60 flex-col overflow-auto rounded-lg border" onmousedown={(event) => event.preventDefault()}>
      {#if allowEmpty}
        <button type="button" class="hover:bg-muted px-2.5 py-1.5 text-left text-sm" onclick={clear}>None</button>
      {/if}
      {#each rows as store (store.id)}
        <button
          type="button"
          class="hover:bg-muted px-2.5 py-1.5 text-left text-sm {String(store.id) === value ? 'bg-muted' : ''}"
          onclick={() => pick(store)}
        >
          {store.label}
        </button>
      {/each}
      {#if error}
        <p class="text-destructive px-2.5 py-1.5 text-sm">{error}</p>
      {:else if loading && rows.length === 0}
        <p class="text-muted-foreground px-2.5 py-1.5 text-sm">Loading…</p>
      {:else if rows.length === 0}
        <p class="text-muted-foreground px-2.5 py-1.5 text-sm">{q.trim() ? `No store matches “${q.trim()}”.` : emptyLabel}</p>
      {/if}
      {#if more}
        <Button type="button" variant="ghost" size="sm" disabled={loading} onclick={() => load(false)}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      {/if}
    </div>
  {/if}
</div>
