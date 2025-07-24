<script lang="ts">
    import { Meter, useId } from 'bits-ui';
    import type { ComponentProps } from 'svelte';

    let { max = 100, value = 0, min = 0 }: ComponentProps<typeof Meter.Root> & {} = $props();

    const labelId = useId();
</script>

<div class="flex flex-col gap-2">
    <Meter.Root
        aria-labelledby={labelId}
        aria-valuetext="{value} out of {max}"
        {value}
        {min}
        {max}
        class="relative h-[8px] overflow-hidden bg-gray-900"
        title={`${value.toLocaleString('nl-NL')} / ${max.toLocaleString('nl-NL')}`}
    >
        <div
            class="shadow-mini-inset h-full w-full flex-1 bg-gray-300 transition-all duration-1000 ease-in-out"
            style="transform: translateX(-{100 - (100 * (value ?? 0)) / max}%)"
        ></div>
    </Meter.Root>
</div>
