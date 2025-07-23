<script lang="ts">
    import { cn } from '$lib/utils';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    type Props = {
        children: Snippet;
    } & HTMLAttributes<HTMLElement>;

    let { children, ...restProps }: Props = $props();
</script>

<nav class={cn('flex flex-col gap-1 p-6', restProps.class)} {...restProps}>
    {@render children()}
</nav>
