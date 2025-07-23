<script lang="ts">
    import { cn } from '$lib/utils';
    import Input from './input.svelte';
    import Label from './label.svelte';

    type Props = {
        label?: string;
        name?: string;
        items: Array<{
            label: string;
            value: string;
        }>;
    };

    let { label, name, items = $bindable() }: Props = $props();
</script>

<div class="flex max-w-md flex-col gap-2">
    {#if label}
        <Label>{label}</Label>
    {/if}
    <div class="flex flex-col gap-[2px]">
        {#each items as item}
            <div class="grid grid-cols-[1fr_auto] gap-[2px]">
                <Input
                    class={cn(
                        'flex-1 truncate border-1 border-gray-800 bg-gray-800 px-3 py-1',
                        'focus:border-1 focus:border-gray-100 focus:bg-gray-900',
                    )}
                    bind:value={item.value}
                />
                <button
                    class="flex w-8 cursor-pointer items-center justify-center bg-gray-700 text-primary-100"
                    aria-label="Delete item"
                    title="Delete item"
                    onclick={() => {
                        items = items.filter((i) => i.value !== item.value);
                    }}
                >
                    <i class="hn hn-trash text-xl"></i>
                </button>
            </div>
        {/each}
        <button
            class="ms-auto w-26 cursor-pointer py-2 text-center text-sm font-semibold text-primary-100 hover:text-primary"
            onclick={() => {
                items = [...items, { label: '', value: '' }];
            }}
        >
            Add item
        </button>
    </div>
    <input type="hidden" {name} value={JSON.stringify(items)} />
</div>
