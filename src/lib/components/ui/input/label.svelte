<script lang="ts">
    import { cn } from '$lib/utils';
    import { Label, type LabelRootProps } from 'bits-ui';

    type Props = {} & LabelRootProps;

    let { children, ...restProps }: Props = $props();
</script>

<Label.Root {...restProps} class={cn('font-medium text-gray-500 uppercase', restProps.class)}>
    {@render children?.()}
</Label.Root>
