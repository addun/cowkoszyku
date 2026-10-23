<script lang="ts">
  import Notice from '$lib/admin/Notice.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { formatQty } from '$lib/format';
  import { resourceView, arr, countLabel, obj, text } from '$lib/admin/view';
  let { data } = $props();
  const props = $derived({
    units: data.units,
  });

  const view = $derived(resourceView(props));
  const units = $derived(arr(view.units));
</script>

<svelte:head><title>Units · cowkoszyku</title></svelte:head>

<Notice message={data.error} />
<div class="flex flex-wrap items-center justify-between gap-3">
  <h1 class="text-2xl font-semibold tracking-tight">Units</h1>
  <Button href="/admin/units/new">Add unit</Button>
</div>

{#if units.length === 0}
  <Empty.Root class="border">
    <Empty.Header>
      <Empty.Title>No units yet.</Empty.Title>
    </Empty.Header>
  </Empty.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Name</Table.Head>
        <Table.Head>Compare</Table.Head>
        <Table.Head>Used in</Table.Head>
        <Table.Head class="text-right">Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each units as unit (text(obj(unit).id))}
        {@const row = obj(unit)}
        <Table.Row>
          <Table.Cell class="font-medium">{text(row.name)}</Table.Cell>
          <Table.Cell>{formatQty(text(row.compareValue))}</Table.Cell>
          <Table.Cell>
            {#if Number(row.productCount) > 0}
              <a class="hover:underline" href="/admin/products?unit={row.id}">{countLabel(Number(row.productCount), 'product', 'products')}</a>
            {:else}
              {countLabel(0, 'product', 'products')}
            {/if}
          </Table.Cell>
          <Table.Cell class="text-right">
            <Button variant="ghost" size="sm" href="/admin/units/{row.id}/edit">Edit</Button>
            {#if !row.productCount}
              <Button variant="ghost" size="sm" class="text-destructive" href="/admin/units/{row.id}/delete">Delete</Button>
            {/if}
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{/if}
