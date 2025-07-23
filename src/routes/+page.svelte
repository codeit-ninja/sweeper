<script lang="ts">
    import { app } from '$core/app';
    import { Button } from '$lib/components/ui/button';
    import { dialog } from '$lib/components/ui/dialog';
    import { H } from '$lib/components/ui/h';
    import { Input, Options } from '$lib/components/ui/input';
    import { onMount } from 'svelte';

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

    onMount(() => {
        dialog.open = true;
        dialog.title = 'Create New Scan';
        dialog.component = dialogContent;
    });
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
                value={`/(?<=\"|\'|\s|=)(sk_[a-zA-Z0-9]{48}|[a-zA-Z0-9]{32})(?=\"|\'|\n|$)/gm`}
                placeholder={`Example: /(?<=\"|\'|\s|=)(sk_[a-zA-Z0-9]{48}|[a-zA-Z0-9]{32})(?=\"|\'|\n|$)/gm`}
            />
        </div>
        <div class="mb-6">
            <Options
                label="Search patterns"
                name="searchPatterns"
                items={[
                    {
                        label: 'sk_+elevenlabs+api_key+OR+api-key+extension:py',
                        value: 'sk_+elevenlabs+api_key+OR+api-key+extension:py',
                    },
                    {
                        label: 'sk_+elevenlabs+api_key+OR+api-key+extension:js',
                        value: 'sk_+elevenlabs+api_key+OR+api-key+extension:js',
                    },
                    {
                        label: 'sk_+elevenlabs+api_key+OR+api-key+extension:env',
                        value: 'sk_+elevenlabs+api_key+OR+api-key+extension:env',
                    },
                    {
                        label: 'elevenlabs+xi_api_key+extension:js',
                        value: 'elevenlabs+xi_api_key+extension:js',
                    },
                ]}
            />
        </div>
        <div class="ms-auto mt-auto">
            <Button>Create Scan</Button>
        </div>
    </form>
{/snippet}

<div>
    <Button
        onclick={() => {
            dialog.open = true;
            dialog.title = 'Create New Scan';
            dialog.component = dialogContent;
        }}>Create new scan</Button
    >
</div>
