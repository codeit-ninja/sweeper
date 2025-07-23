<script lang="ts">
    import { app } from '$core/app';
    import { H } from '$lib/components/ui/h';
    import { Dialog } from '$lib/components/ui/dialog';
    import * as Nav from '$lib/components/ui/nav';

    import '@fontsource/gotu';
    import '@fontsource-variable/bitcount-grid-single';
    import '@fontsource-variable/museomoderno';
    import '@fontsource-variable/handjet';
    import '@hackernoon/pixel-icon-library/fonts/iconfont.css';

    import '../app.css';

    let { children } = $props();
</script>

<div class="flex h-screen flex-col">
    <div class="grid h-full grid-cols-[300px_1fr]">
        <aside class="border-r border-gray-700">
            <div class="border-b border-gray-700 p-6">
                <a href="/" class="inline-block text-5xl font-medium">Sweeper</a>
            </div>
            <Nav.Root>
                {#each app.routes as route}
                    <Nav.Item href={route.href}>{route.name}</Nav.Item>
                {/each}
            </Nav.Root>
        </aside>
        <main class="flex flex-1 flex-col">
            <header class="p-8">
                <H level="1">{app.route.meta.title}</H>
            </header>
            <div class="px-8">
                {@render children()}
            </div>
        </main>
    </div>
</div>

<Dialog />
