import { app } from '$core/app';
import { Bootable } from '$lib/bootable.svelte';
import { errAsync, fromPromise, fromSafePromise, ok, type Result, ResultAsync } from 'neverthrow';
import Worker from './scanner.worker?worker';
import type { QueryResult } from '@tauri-apps/plugin-sql';
import type { DatabaseError } from '$core/app/database/table';
import type { HitEvent } from './scanner.worker';

export const ScannerErrors = {
    CHECK_FOR_JOBS_ERROR: (data?: any) => ({
        type: 'CHECK_FOR_JOBS_ERROR' as const,
        message: 'Error checking for scan jobs',
        data,
    }),
    CREATE_JOB_ERROR: (data?: any) => ({
        type: 'CREATE_JOB_ERROR' as const,
        message: 'Error creating scan job',
        data,
    }),
};

export type ScannerError = ReturnType<(typeof ScannerErrors)[keyof typeof ScannerErrors]>;

export class Scanner extends Bootable {
    enabled = true;

    manualBoot = true;

    worker = $state<Worker>();

    /**
     * Interval for checking for scan jobs.
     * This is used to periodically check for new scan jobs and start them.
     *
     * @type {number | null}
     * @memberof Scanner
     * @private
     */
    #interval: number | null = null;

    async boot() {
        //this.#interval = setInterval(() => this.checkForJobs(), 1000);
        this.checkForJobs();
        this.worker = new Worker();

        this.worker.onmessage = (event: MessageEvent<HitEvent>) => {
            if (event.data.type === 'hit') {
                const { jobId, repo, keys, hash } = event.data.payload;

                app.database.getTable('scan_hits').insert({
                    jobId,
                    output: { repo, hash, keys },
                });
            }
        };
    }

    async checkForJobs() {
        const scanJobs = await app.database.getTable('scan_jobs').getMany({ startedAt: null });
        console.log(scanJobs);
        if (scanJobs.isOk()) {
            if (scanJobs.value.length === 0) {
                return;
            }

            this.worker!.postMessage({ type: 'jobs', payload: scanJobs.value });

            scanJobs.value.forEach((job) => {
                app.database.getTable('scan_jobs').update(
                    {
                        startedAt: new Date().toISOString(),
                    },
                    {
                        id: job.id,
                    },
                );
            });
        }
    }

    create(name: string, matcher: string, patterns: string[]): ResultAsync<QueryResult, ScannerError> {
        const job = {
            name,
            matcher,
            patterns,
        };

        return fromPromise(
            app.pocketbase.client.collection('sweep_jobs').create({
                name,
                matcher,
                patterns,
            }),
            () => {
                return ScannerErrors.CREATE_JOB_ERROR(job);
            },
        );
    }

    shutdown(): void {
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }

        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
        }
    }
}
