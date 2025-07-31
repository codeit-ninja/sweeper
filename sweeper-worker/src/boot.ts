import { SweepJobsResponse } from '@pocketbase/types';
import { pocketbase } from './pocketbase/index.ts';

export interface AppSettings {
    githubAccessToken: string;
    maxWorkers: number;
}

export class Program {
    workers: Map<string, Worker> = new Map();

    queue: Map<string, SweepJobsResponse> = new Map();

    settings: AppSettings = {
        githubAccessToken: '',
        maxWorkers: 8,
    };

    async boot() {
        const jobs = await pocketbase.collection('sweep_jobs').getFullList({ filter: 'startedAt = ""' });
        const settings = await pocketbase.collection('settings').getFullList();

        for (const setting of settings) {
            this.settings[setting.id as keyof AppSettings] = setting.value as never;
        }

        for (const job of jobs) {
            this.queue.set(job.id, job);
        }

        setInterval(() => this.processQueue(), 1000);
    }

    processQueue() {
        const next = this.queue.entries().next();

        if (this.queue.size === 0 && this.workers.size >= 8) return;
        if (next.done) return;

        const [id, job] = next.value;

        //  Offload heavy work to a worker
        if (!this.workers.has(id)) {
            const worker = new Worker(new URL('./worker.ts', import.meta.url), {
                type: 'module',
            });

            // Send the job to the worker for processing.
            worker.postMessage({ type: 'settings', payload: this.settings });
            worker.postMessage({ type: 'job', payload: job });

            this.workers.set(id, worker);
            this.queue.delete(id);
        }
    }
}
