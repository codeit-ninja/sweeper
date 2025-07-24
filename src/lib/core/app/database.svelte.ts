import { Table } from './database/table';
import { Bootable } from '$lib/bootable.svelte';
import Db from '@tauri-apps/plugin-sql';
import { app } from '.';
import { ScanJobs } from './database/scan-jobs';
import { ScanHits } from './database/scan-hits';

export class Database extends Bootable {
    #database: Db | null = null;

    enabled = true;

    manualBoot = true;

    private tables = {
        scan_jobs: new ScanJobs(),
        scan_hits: new ScanHits(),
    };

    async boot(): Promise<void> {
        for (const table of Object.values(this.tables)) {
            if (table instanceof Table) {
                await table.create();
            }
        }
    }

    getDatabase() {
        return (this.#database ??= new Db('sqlite:data.db'));
    }

    getTable<K extends keyof typeof this.tables>(name: K): (typeof this.tables)[K] {
        return this.tables[name];
    }
}
