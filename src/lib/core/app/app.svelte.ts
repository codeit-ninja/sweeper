import { Bootable } from '$lib/bootable.svelte';
import { Scanner } from '$core/scanner';
import { page } from '$app/state';
import { Database } from './database.svelte';
import DB from '@tauri-apps/plugin-sql';
import { Store } from '@tauri-apps/plugin-store';
import { watch } from 'runed';

export type Route = {
    name: string;
    path: string;
    href: string;
    meta: {
        title: string;
        description?: string;
    };
};

export interface AppSettings {
    githubToken: string;
}

export class App extends Bootable {
    enabled = true;

    manualBoot = true;

    database = new Database();

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

    store = $state<Store>() as Store;

    settings: AppSettings = $state({
        githubToken: '',
    });

    async boot() {
        await DB.load('sqlite:data.db');
        await this.scanner.boot();
        await this.database.boot();

        this.store = await Store.load('settings.json');
        this.settings = (await this.store.get<AppSettings>('settings')) || this.settings;

        $effect.root(() => {
            watch(
                () => $state.snapshot(this.settings),
                () => {
                    this.store.set('settings', this.settings);
                },
            );
        });
    }
}

export const app = new App();
