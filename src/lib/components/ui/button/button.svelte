<script lang="ts">
    import { cn } from '$lib/utils';
    import { Button, type ButtonRootProps } from 'bits-ui';
    import type { Snippet } from 'svelte';

    type Props = ButtonRootProps & {
        variant?: 'primary' | 'secondary';
        children: Snippet;
    };

    let { variant = 'secondary', children, ...restProps }: Props = $props();
</script>

<Button.Root
    class={cn(
        'cursor-pointer rounded-md bg-primary px-3 py-2 transition-colors hover:bg-primary-300',
        variant === 'secondary' && 'bg-gray-700 text-white',
    )}
    {...restProps}
>
    {@render children()}
</Button.Root>
