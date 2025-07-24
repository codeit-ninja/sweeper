<script lang="ts">
    import Meter from '$lib/components/ui/meter/meter.svelte';
    import { subscription } from '@elevenlabs/elevenlabs-js/api/resources/user';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<div class="grid gap-1">
    <div class="grid grid-cols-[2fr_0.6fr_0.6fr_0.4fr] items-center gap-x-12 rounded-md bg-gray-900 px-4 py-2">
        <span class="font-semibold">Key</span>
        <span class="font-semibold">Tier</span>
        <span class="font-semibold">Usage</span>
        <span class="font-semibold">First Name</span>
    </div>
    {#each data.hits as hit (hit.id)}
        {@const output = JSON.parse(hit.output as string).keys[0]}
        {@const subscription = output.subscription}
        {console.log(output)}
        <div
            class="grid grid-cols-[2fr_0.6fr_0.6fr_0.4fr] items-center gap-x-12 rounded-md px-4 py-2 hover:bg-primary-950"
        >
            <span class="truncate">{output.keys[0]}</span>
            <span class="truncate">{subscription.tier}</span>
            <span>
                <Meter min={0} max={subscription.characterLimit} value={subscription.characterCount} />
            </span>
            <span class="truncate">{output.firstName}</span>
        </div>
    {/each}
</div>
