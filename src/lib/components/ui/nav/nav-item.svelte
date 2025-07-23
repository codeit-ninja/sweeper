<script lang="ts">
    import { page } from '$app/state';
    import { cn } from '$lib/utils';
    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    type Props = {
        href: string;
        children: Snippet;
    } & HTMLAnchorAttributes;

    let { href, children, ...restProps }: Props = $props();
    let isActive = $derived.by(() => {
        return page.url.pathname === href;
    });
</script>

<a {href} {...restProps} class={cn(isActive && 'text-primary', !isActive && 'hover:text-primary-100')}>
    {@render children()}
</a>
