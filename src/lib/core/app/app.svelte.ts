import { Bootable } from '$lib/bootable.svelte';
import { Scanner } from '$core/scanner';
import { page } from '$app/state';
import { Database } from './database.svelte';
import DB from '@tauri-apps/plugin-sql';
import { Store } from '@tauri-apps/plugin-store';
import { Command } from '@tauri-apps/plugin-shell';
import { watch } from 'runed';
import { appDataDir } from '@tauri-apps/api/path';
import { Pocketbase } from './pocketbase';
import { Settings } from './settings.svelte';

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

    scanner = new Scanner();

    pocketbase = new Pocketbase();

    settings = new Settings();

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

    async boot() {
        await DB.load('sqlite:data.db');
        await this.scanner.boot();

        const rootDir = await appDataDir();
        const command = Command.sidecar('binaries/pocketbase', [
            'serve',
            '--http=0.0.0.0:49230',
            `--dir=${rootDir}/pb_data`,
            `--publicDir=${rootDir}/pb_public`,
            `--migrationsDir=${rootDir}/pb_migrations`,
        ]);
        await command.spawn();

        this.store = await Store.load('settings.json');
        //this.settings = (await this.store.get<AppSettings>('settings')) || this.settings;

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
