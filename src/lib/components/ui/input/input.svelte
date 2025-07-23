<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { useId } from 'bits-ui';
    import { cn } from '$lib/utils';
    import Label from './label.svelte';

    type Props = {
        label?: string;
    } & HTMLInputAttributes;

    let id = useId('input');
    let { value = $bindable(), label, ...restProps }: Props = $props();
</script>

<div class="flex flex-col gap-2">
    {#if label}
        <Label>{label}</Label>
    {/if}
    <input
        bind:value
        {id}
        {...restProps}
        class={cn('border border-dashed border-white px-4 py-2 outline-none', restProps.class)}
    />
</div>
