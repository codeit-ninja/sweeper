<script lang="ts">
    import { cn } from '$lib/utils';
    import type { Snippet } from 'svelte';

    type Props = {
        level: '1' | '2' | '3' | '4' | '5' | '6' | 1 | 2 | 3 | 4 | 5 | 6;
        children: Snippet;
    };

    let { level, children }: Props = $props();
</script>

<svelte:element
    this={`h${level}`}
    class={cn(
        'font-semibold',
        level === '1' && 'text-3xl',
        level === '2' && 'text-2xl',
        level === '3' && 'text-xl',
        level === '4' && 'text-lg',
        level === '5' && 'text-base',
        level === '6' && 'text-sm',
    )}
>
    {@render children()}
</svelte:element>
