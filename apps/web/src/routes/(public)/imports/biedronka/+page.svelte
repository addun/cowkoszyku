<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button/index.js';

  let helper = $state(false);

  onMount(() => {
    helper = document.documentElement.dataset.cowkoszykuBiedronkaExt === '1';
  });
</script>

<svelte:head>
  <title>Biedronka import · cowkoszyku</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-semibold tracking-tight">Biedronka import</h1>
    <p class="text-muted-foreground max-w-2xl">The helper opens the bill list and talks to Moja Biedronka. This site only saves the finished bill.</p>
  </div>
  <div>
    <Button type="button" data-cowkoszyku-open-import disabled={!helper}>Open Biedronka import</Button>
  </div>
  <p id="open-status" class="text-muted-foreground text-sm"></p>
  <p class="text-muted-foreground max-w-2xl text-sm">
    {#if helper}
      The bill list opens in the helper’s own tab. Sign in there, then import. Tokens stay in the helper.
    {:else}
      Load the unpacked helper from extensions/biedronka (Chrome, Edge, Brave, or Arc), then refresh. It matches localhost:5173, 127.0.0.1:5173, localhost:3000, cowkoszyku.home.arpa, and cowkoszyku.piekna2.pl.
    {/if}
  </p>
</div>
