<script lang="ts">
  import SearchIcon from '@lucide/svelte/icons/search';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import ProductTile, { type ProductTileData } from '$lib/ProductTile.svelte';

  let { data } = $props();

  let query = $state('');
  let search = $state<{ products: ProductTileData[]; error: string } | null>(null);
  let active = $state(-1);
  let timer = 0;
  let request = 0;

  const mode = $derived(query.trim() && search ? 'search' : 'popular');
  const products = $derived(mode === 'search' && search ? search.products : data.products);
  const error = $derived(mode === 'search' && search ? search.error : data.error);

  async function load(q: string) {
    const id = ++request;
    try {
      const res = await fetch(`/api/lookup.json?q=${encodeURIComponent(q)}`);
      if (id !== request) return;
      if (!res.ok) {
        search = { products: [], error: 'Nie udało się wyszukać produktów.' };
        return;
      }
      const body = (await res.json()) as { products: ProductTileData[] };
      search = { products: body.products, error: '' };
      active = -1;
    } catch {
      if (id !== request) return;
      search = { products: [], error: 'API jest niedostępne.' };
    }
  }

  function onInput(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value;
    query = value;
    const q = value.trim();
    clearTimeout(timer);
    if (!q) {
      request += 1;
      active = -1;
      return;
    }
    timer = window.setTimeout(() => {
      void load(q);
    }, 150);
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
