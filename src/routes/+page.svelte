<script lang="ts">
    import type { ScanJob } from '$core/app/database/scan-jobs';
    import type { Model } from '$core/app/database/table';
    import { app } from '$core/app';
    import { Button } from '$lib/components/ui/button';
    import { dialog } from '$lib/components/ui/dialog';
    import { H } from '$lib/components/ui/h';
    import { Input, Options } from '$lib/components/ui/input';
    import { onMount } from 'svelte';
    import { resource } from 'runed';

    const submit = async (event: Event) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const name = formData.get('name') as string;
        const matcher = formData.get('matcher') as string;
        const searchPatterns = JSON.parse(formData.get('searchPatterns') as string) as {
            label: string;
            value: string;
        }[];

        const result = await app.scanner.create(
            name,
            matcher,
            searchPatterns.map((item) => item.value),
        );

        if (result.isOk()) {
            console.log(result.value);
        } else {
            console.error(result.error);
        }
    };

    let page = $state(1);
    app.pocketbase.client.collection('sweep_jobs').subscribe('*', (e) => {
        console.log(e);
    });

    const jobs = resource(
        () => page,
        () => app.pocketbase.client.collection('sweep_jobs').getList(page),
    );
    // onMount(async () => {
    //     dialog.open = true;
    //     dialog.title = 'Create New Scan';
    //     dialog.component = dialogContent;
    // });
</script>

{#snippet dialogContent()}
    <form class="flex flex-1 flex-col" onsubmit={submit}>
        <div class="mb-6">
            <Input label="Name" name="name" value={`Elevenlabs API Key Scan`} placeholder={`Give me a nice name`} />
        </div>
        <div class="mb-6">
            <Input
                label="Matcher"
                name="matcher"
                value={`(?<="|'|\\s|=)(xai-[a-zA-Z0-9]{64,})(?="|'|\\s|$)`}
                placeholder={`Example: /(?<=\"|\'|\s|=)(sk_[a-zA-Z0-9]{48}|[a-zA-Z0-9]{32})(?=\"|\'|\n|$)/gm`}
            />
        </div>
        <div class="mb-6">
            <Options
                label="Search patterns"
                name="searchPatterns"
                items={[
                    {
                        label: 'xai_+xai+api_key+OR+api-key+extension:py',
                        value: 'xai_+xai+api_key+OR+api-key+extension:py',
                    },
                    {
                        label: 'xai_+xai+api_key+OR+api-key+extension:js',
                        value: 'xai_+xai+api_key+OR+api-key+extension:js',
                    },
                    {
                        label: 'xai_+xai+api_key+OR+api-key+extension:env',
                        value: 'xai_+xai+api_key+OR+api-key+extension:env',
                    },
                    {
                        label: 'xai+xai_api_key+extension:js',
                        value: 'xai+xai_api_key+extension:js',
                    },
                ]}
            />
        </div>
        <div class="ms-auto mt-auto">
            <Button>Create Scan</Button>
        </div>
    </form>
{/snippet}

<div class="mb-6 flex items-center justify-between">
    <H level="3">Latest scan jobs</H>
    <Button
        onclick={() => {
            dialog.open = true;
            dialog.title = 'Create New Scan';
            dialog.component = dialogContent;
        }}>Create new scan</Button
    >
</div>
<div class="grid gap-1">
    <div class="grid grid-cols-[30%_30%_20%_20%] gap-2 rounded-md bg-gray-900 px-4 py-2">
        <span class="font-bold">Name</span>
        <span class="font-bold">Matcher</span>
        <span class="font-bold">Created At</span>
        <span class="font-bold">Started At</span>
    </div>
    {#each jobs.current?.items! as scan}
        <a
            class="grid grid-cols-[30%_30%_20%_20%] gap-2 rounded-md px-4 py-2 hover:bg-primary-950"
            href="/scans/{scan.id}"
        >
            <span class="truncate">{scan.name}</span>
            <span class="truncate">{scan.matcher}</span>
            <span class="truncate">{scan.createdAt}</span>
            <span class="truncate">{scan.startedAt ? scan.startedAt : 'Not started yet'}</span>
        </a>
    {/each}
</div>
