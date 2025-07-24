import { Table } from './table';

export interface ScanHit {
    jobId: number;
    output: unknown | null;
}

export class ScanHits extends Table<ScanHit> {
    readonly name = 'scan_results';
    readonly fields = {
        jobId: 'INTEGER NOT NULL',
        output: 'JSON NULL',
    };
}
