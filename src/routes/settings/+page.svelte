<script>
    import { app } from '$core/app';
    import { Label } from '$lib/components/ui/input';
    import Input from '$lib/components/ui/input/input.svelte';
    import { watch } from 'runed';
</script>

<div class="mb-4 flex max-w-md flex-col gap-2">
    <Label>Github API key</Label>
    <Input
        name="githubToken"
        bind:value={app.settings.githubToken}
        placeholder="Enter your Github API key"
        type="text"
    />
</div>
