<script>
    import { app } from '$core/app';
    import { Label } from '$lib/components/ui/input';
    import Input from '$lib/components/ui/input/input.svelte';
    import { watch } from 'runed';

    let { settings } = app.settings;
</script>

<div class="mb-4 flex max-w-md flex-col gap-2">
    <Label>Github API key</Label>
    <Input
        name="githubToken"
        bind:value={settings.githubAccessToken}
        placeholder="Enter your Github API key"
        type="text"
    />
</div>

<div class="mb-4 flex max-w-md flex-col gap-2">
    <Label>Max workers</Label>
    <Input
        name="maxWorkers"
        bind:value={settings.maxWorkers}
        placeholder="Enter the maximum number of workers"
        type="number"
    />
</div>
