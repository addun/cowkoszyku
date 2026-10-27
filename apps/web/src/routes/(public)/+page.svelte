<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import SearchIcon from '@lucide/svelte/icons/search';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import ProductTile, { type ProductTileData } from '$lib/ProductTile.svelte';

  let { data } = $props();

  let query = $state(data.query);
  let active = $state(-1);
  let timer = 0;

  const q = $derived(query.trim());
  const mode = $derived(q && (q === data.query || data.query) ? 'search' : 'popular');
  const products = $derived(mode === 'search' ? data.products : data.popular);
  const error = $derived(mode === 'search' ? (q === data.query ? data.searchError : '') : data.error);

  $effect(() => {
    void data.query;
    active = -1;
  });

  function commit(value: string) {
    const url = new URL(page.url);
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    const href = `${url.pathname}${url.search}`;
    if (href === `${page.url.pathname}${page.url.search}`) return;
    void goto(href, { replaceState: true, keepFocus: true, noScroll: true }).catch(() => {});
  }

  function onInput(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value;
    query = value;
    const next = value.trim();
    clearTimeout(timer);
    if (!next) {
      active = -1;
      commit('');
      return;
    }
    timer = window.setTimeout(() => commit(next), 150);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;
    if (!products.length) return;
    if (event.key === 'Enter') {
      if (active < 0) return;
      event.preventDefault();
      location.href = `/products/${products[active]!.id}`;
      return;
    }
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? active + 1 : active - 1;
    active = (next + products.length) % products.length;
  }

</script>

<svelte:head>
  <title>Czy to promka · cowkoszyku</title>
</svelte:head>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-3">
    <h1 class="text-3xl font-semibold tracking-tight">Czy to promka?</h1>
    <p class="text-muted-foreground">Szukaj produktu i sprawdź, czy dzisiejsza cena to prawdziwa Promocja</p>
    <form class="relative" onsubmit={(event) => event.preventDefault()}>
      <label class="sr-only" for="q">Szukaj produktu</label>
      <SearchIcon class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input id="q" name="q" type="search" value={query} class="pl-8" autocomplete="off" autofocus oninput={onInput} onkeydown={onKeydown} />
    </form>
  </div>

  {#if error}
    <Alert.Root variant="destructive">
      <Alert.Description>{error}</Alert.Description>
    </Alert.Root>
  {:else if mode === 'search'}
    {#if products.length}
      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-medium">Wyniki</h2>
        <ul class="grid gap-3">
          {#each products as card, index (card.id)}
            {@render promo(card, index)}
          {/each}
        </ul>
      </section>
    {:else}
      <Empty.Root class="border">
        <Empty.Header>
          <Empty.Title>Brak pasujących produktów.</Empty.Title>
        </Empty.Header>
      </Empty.Root>
    {/if}
  {:else if products.length}
    <section class="flex flex-col gap-3">
      <h2 class="text-sm font-medium">Popularne teraz</h2>
      <ul class="grid gap-3">
        {#each products as card, index (card.id)}
          {@render promo(card, index)}
        {/each}
      </ul>
    </section>
  {:else}
    <Empty.Root class="border">
      <Empty.Header>
        <Empty.Description>Na liście nic jeszcze nie ma. Zeskanuj paragon w panelu, żeby zacząć.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/if}
</div>

{#snippet promo(card: ProductTileData, index: number)}
  <li>
    <ProductTile {card} href="/products/{card.id}" active={index === active} />
  </li>
{/snippet}
