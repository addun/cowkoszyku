<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { isHttpError } from '@sveltejs/kit';
  import { listProducts } from '$lib/api/admin/products';
  import type { AdminProductResponse } from '@cowkoszyku/contract/admin/products';

  const LIMIT = 20;

  let {
    name = 'product_id',
    id,
    value = $bindable(''),
    label = '',
    placeholder = 'Find a product',
    allowEmpty = true,
    emptyValue = '',
    emptyOption = 'None',
    exclude = '',
    emptyLabel = 'No products yet.',
    onSelect,
  }: {
    name?: string;
    id?: string;
    value?: string;
    label?: string;
    placeholder?: string;
    allowEmpty?: boolean;
    emptyValue?: string;
    emptyOption?: string;
    exclude?: string;
    emptyLabel?: string;
    onSelect?: (detail: { id: string; name: string; label: string }) => void;
  } = $props();

  let q = $state('');
  let open = $state(false);
  let rows = $state<AdminProductResponse[]>([]);
  let offset = $state(0);
  let more = $state(false);
  let loading = $state(false);
  let error = $state('');
  let selected = $state(String(value ?? ''));
  let pickedId = $state('');
  let pickedLabel = $state('');
  let synced = $state<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request = 0;

  const shown = $derived(
    selected && selected !== emptyValue
      ? pickedId === selected
        ? pickedLabel
        : label || `Product ${selected}`
      : allowEmpty && selected === emptyValue && emptyOption
        ? emptyOption
        : '',
  );

  $effect(() => {
    const next = String(value ?? '');
    if (next === synced) return;
    synced = next;
    selected = next;
    if (pickedId && pickedId !== next) {
      pickedId = '';
      pickedLabel = '';
    }
  });

  function rowLabel(product: AdminProductResponse): string {
    return product.unitName ? `${product.name} (${product.unitName})` : product.name;
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
      const skip = String(exclude);
      const incoming = skip ? body.products.filter((product) => String(product.id) !== skip) : body.products;
      rows = reset ? incoming : [...rows, ...incoming];
      offset = nextOffset + body.products.length;
      more = body.products.length === LIMIT;
    } catch (err) {
      if (token !== request) return;
      error = isHttpError(err) && err.status !== 503 ? 'Could not load products.' : 'API is unavailable.';
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

  function commit(next: string, productName: string, nextLabel: string) {
    selected = next;
    value = next;
    if (next && next !== emptyValue) {
      pickedId = next;
      pickedLabel = nextLabel;
    } else {
      pickedId = '';
      pickedLabel = '';
    }
    onSelect?.({ id: next, name: productName, label: nextLabel });
    q = '';
    open = false;
    resetResults();
  }

  function pick(product: AdminProductResponse) {
    commit(String(product.id), product.name, rowLabel(product));
  }

  function chooseEmpty() {
    commit(emptyValue, '', emptyOption);
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
  {#if name}<input type="hidden" {name} value={selected} />{/if}
  {#if shown}
    <div class="flex items-center justify-between gap-2 text-sm">
      <span>{shown}</span>
      {#if allowEmpty && selected && selected !== emptyValue}
        <Button type="button" variant="ghost" size="sm" onclick={chooseEmpty}>Clear</Button>
      {/if}
    </div>
  {/if}
  <Input {id} {placeholder} autocomplete="off" bind:value={q} onfocus={onFocus} oninput={onInput} onkeydown={onKeydown} />
  {#if open}
    <div class="flex max-h-60 flex-col overflow-auto rounded-lg border" onmousedown={(event) => event.preventDefault()}>
      {#if allowEmpty}
        <button type="button" class="hover:bg-muted px-2.5 py-1.5 text-left text-sm" onclick={chooseEmpty}>{emptyOption}</button>
      {/if}
      {#each rows as product (product.id)}
        <button
          type="button"
          class="hover:bg-muted px-2.5 py-1.5 text-left text-sm {String(product.id) === selected ? 'bg-muted' : ''}"
          onclick={() => pick(product)}
        >
          {rowLabel(product)}
        </button>
      {/each}
      {#if error}
        <p class="text-destructive px-2.5 py-1.5 text-sm">{error}</p>
      {:else if loading && rows.length === 0}
        <p class="text-muted-foreground px-2.5 py-1.5 text-sm">Loading…</p>
      {:else if rows.length === 0}
        <p class="text-muted-foreground px-2.5 py-1.5 text-sm">{q.trim() ? `No product matches “${q.trim()}”.` : emptyLabel}</p>
      {/if}
      {#if more}
        <Button type="button" variant="ghost" size="sm" disabled={loading} onclick={() => load(false)}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      {/if}
    </div>
  {/if}
</div>
