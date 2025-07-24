// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)

import { browser } from '$app/environment';
import { app } from '$lib/core/app/app.svelte';

// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = false;
export const ssr = false;

export const load = async () => {
    if (!browser) {
        return;
    }

    await app.boot();
    app.emit('booted');
};
