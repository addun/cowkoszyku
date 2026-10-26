<script lang="ts">
  import type { Snippet } from 'svelte';
  import * as Card from '$lib/components/ui/card/index.js';

  export type ProductTileData = {
    id?: number;
    name: string;
    image: string;
    initial?: string;
    now: string;
    extras?: { price: string; unitName: string }[];
    priceNote: string;
  };

  let {
    card,
    href,
    active = false,
    actions,
  }: {
    card: ProductTileData;
    href: string;
    active?: boolean;
    actions?: Snippet;
  } = $props();

  const letter = $derived(card.initial || (card.name.trim().charAt(0) || '?').toUpperCase());
</script>

<Card.Root class="transition-colors hover:bg-muted/40 {active ? 'ring-ring ring-2' : ''}">
  <Card.Content class="flex items-center gap-3">
    <a class="flex min-w-0 flex-1 items-center gap-3" {href}>
      {#if card.image}
        <img class="size-12 shrink-0 rounded-lg object-cover" src={card.image} alt="" />
      {:else}
        <span class="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-medium" aria-hidden="true">
          {letter}
        </span>
      {/if}
      <span class="min-w-0 flex-1 font-medium">{card.name}</span>
      <span class="flex shrink-0 flex-col items-end text-right">
        {#if card.now}
          <span class="font-medium tabular-nums">{card.now}</span>
          {#each card.extras ?? [] as extra}
            <span class="text-muted-foreground text-xs tabular-nums">{extra.price} / {extra.unitName}</span>
          {/each}
        {:else}
          <span class="text-muted-foreground text-sm">Brak ceny</span>
        {/if}
        {#if card.priceNote}
          <span class="text-muted-foreground text-xs">{card.priceNote}</span>
        {/if}
      </span>
    </a>
    {#if actions}
      <span class="flex shrink-0 items-center gap-1">
        {@render actions()}
      </span>
    {/if}
  </Card.Content>
</Card.Root>
