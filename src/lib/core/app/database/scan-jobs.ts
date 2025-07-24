import Database from '@tauri-apps/plugin-sql';
import { app } from '../app.svelte';
import { Table } from './table';

export interface ScanJob {
    name: string;
    matcher: string;
    patterns: string[];
    startedAt?: string | null;
    finishedAt?: string | null;
}

export class ScanJobs extends Table<ScanJob> {
    readonly name = 'scan_jobs';

    readonly fields = {
        name: 'TEXT NOT NULL UNIQUE',
        matcher: 'TEXT NOT NULL',
        patterns: 'JSON NOT NULL',
        startedAt: 'DATETIME DEFAULT NULL',
        finishedAt: 'DATETIME DEFAULT NULL',
    };
}
