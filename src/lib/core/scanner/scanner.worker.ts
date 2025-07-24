import { browser } from '$app/environment';
import type { ScanJob } from '$core/app/database/scan-jobs';
import type { Model } from '$core/app/database/table';
import { Sweeper } from './sweeper';

export type JobsEvent = {
    type: 'jobs';
    payload: Model<ScanJob>[];
};

export type HitEvent = {
    type: 'hit';
    payload: {
        jobId: number;
        content: string;
        repo: string;
        keys: string[];
        hash: string;
    };
};

export type ScannerEvents = JobsEvent;

onmessage = async (event: MessageEvent<ScannerEvents>) => {
    if (event.data.type === 'jobs') {
        for (const job of event.data.payload) {
            new Sweeper('GITHUB_API_TOKEN', job.id, job.matcher, JSON.parse(job.patterns as any).slice(0, 1)).start();
        }
    }
};
