import { Bootable } from '$lib/bootable.svelte';
import Database from '@tauri-apps/plugin-sql';
import { app } from '.';

export class Db extends Bootable {
    enabled = true;

    manualBoot = true;

    database: Database | null = $state(null);

    async boot() {
        this.database = await Database.load('sqlite:data.db');
    }
}
