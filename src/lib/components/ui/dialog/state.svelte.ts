import type { Snippet, SvelteComponent } from 'svelte';

class Dialog {
    open = $state(false);

    title = $state<string | null>(null);

    description = $state<string | null>(null);

    component: Snippet | null = $state(null);

    close() {
        this.open = false;
        this.title = null;
        this.description = null;
        this.component = null;
    }
}

export const dialog = new Dialog();
