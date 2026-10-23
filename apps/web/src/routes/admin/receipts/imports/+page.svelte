<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
</script>

<svelte:head><title>Imports · cowkoszyku</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
  <h1 class="text-2xl font-semibold tracking-tight">Imports</h1>
  <Button variant="outline" href="/admin/receipts">Receipts</Button>
</div>

<ul class="divide-y overflow-hidden rounded-xl border">
  <li>
    <a class="hover:bg-muted/50 block px-3 py-2" href="/admin/receipts/imports/biedronka">
      <span class="block font-medium">Biedronka</span>
      <span class="text-muted-foreground block text-sm">Bills from Moja Biedronka</span>
    </a>
  </li>
</ul>
