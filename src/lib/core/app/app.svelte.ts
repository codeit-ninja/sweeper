import { Bootable } from '$lib/bootable.svelte';
import { Scanner } from '$core/scanner';
import { page } from '$app/state';
import Database from '@tauri-apps/plugin-sql';

export type Route = {
    name: string;
    path: string;
    href: string;
    meta: {
        title: string;
        description?: string;
    };
};

export class App extends Bootable {
    enabled = true;

    manualBoot = true;

    database: Database | null = $state(null);

    scanner = new Scanner();

    routes = $state<Route[]>([
        {
            name: 'Dashboard',
            href: '/',
            path: '/',
            meta: {
                title: 'Dashboard',
            },
        },
        {
            name: 'Settings',
            href: '/settings',
            path: '/settings',
            meta: {
                title: 'Settings',
            },
        },
    ]);

    route = $derived.by(() => {
        return this.routes.find((route) => route.path === page.url.pathname) || this.routes[0];
    });

    async boot() {
        this.database = await Database.load('sqlite:data.db');
        await this.scanner.boot();

        console.log('App booted');
    }
}

export const app = new App();
