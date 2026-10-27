<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { resourceView, arr, obj, text } from '$lib/admin/view';
  let { data } = $props();
  const props = $derived({
    groups: data.groups,
  });

  const view = $derived(resourceView(props));
  const groups = $derived(arr(view.groups));
</script>

<svelte:head><title>Duplicate products · cowkoszyku</title></svelte:head>
<div class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold tracking-tight">Duplicate products</h1>
    <Button variant="outline" href="/admin/products">Products</Button>
  </div>
  <p class="text-muted-foreground">Products that share the same EAN.</p>
</div>

{#if groups.length === 0}
  <Empty.Root class="border">
    <Empty.Header>
      <Empty.Title>No duplicates.</Empty.Title>
    </Empty.Header>
  </Empty.Root>
{:else}
  {#each groups as group (text(obj(group).ean))}
    {@const row = obj(group)}
    <section class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold tracking-tight">EAN {text(row.ean)}</h2>
      <p class="text-muted-foreground text-sm">{text(row.count)} products</p>
      <ul class="divide-y overflow-hidden rounded-xl border">
        {#each arr(row.products) as product (text(obj(product).id))}
          {@const item = obj(product)}
          <li>
            <a class="hover:bg-muted/50 flex items-center gap-3 px-3 py-2" href="/admin/products/{item.id}">
              {#if item.image}
                <img class="size-10 rounded-md object-cover" src={text(item.image)} alt="" />
              {:else}
                <span class="bg-muted size-10 rounded-md" aria-hidden="true"></span>
              {/if}
              <span class="min-w-0 flex-1">
                <span class="block truncate font-medium">{text(item.name)}</span>
                <span class="text-muted-foreground block text-sm">{text(item.unitName)}</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
{/if}
