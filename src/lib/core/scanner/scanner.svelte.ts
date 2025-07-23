import { app } from '$core/app';
import { Bootable } from '$lib/bootable.svelte';
import { errAsync, fromPromise, ok, type Result, ResultAsync } from 'neverthrow';
import Worker from './scanner.worker?worker';
import type { QueryResult } from '@tauri-apps/plugin-sql';

type DATABASE_NOT_INITIALIZED_ERROR = {
    type: 'SCANNER_DATABASE_ERROR';
    message: string;
};

export class Scanner extends Bootable {
    enabled = true;

    manualBoot = true;

    worker = $state<Worker>();

    async boot() {
        // const result = await app.database?.execute('INSERT INTO scanners (matcher, patterns) VALUES (?, ?)', [
        //     '/(?<="|\'|\s|=)(sk_[a-zA-Z0-9]{48}|[a-zA-Z0-9]{32})(?="|\'|\n|$)/gm',
        //     '["sk_12345678901234567890123456789012345678901234567890", "sk_09876543210987654321098765432109876543210987654321"]',
        // ]);
        //const result = await app.database?.execute(
        //     'CREATE TABLE IF NOT EXISTS scanners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, matcher TEXT NOT NULL, patterns JSON NOT NULL)',
        // );
        //const result = await app.database?.select('SELECT * FROM scanners');
        //console.log(result);
    }

    create(
        name: string,
        matcher: string,
        patterns: string[],
    ): ResultAsync<QueryResult, DATABASE_NOT_INITIALIZED_ERROR> {
        if (!app.database) {
            return errAsync({
                type: 'SCANNER_DATABASE_ERROR',
                message: 'Database is not available',
            });
        }

        return fromPromise(
            app.database.execute('INSERT INTO scanners (name, matcher, patterns) VALUES (?, ?, ?)', [
                name,
                matcher,
                patterns,
            ]),
            (error) => {
                return {
                    type: 'SCANNER_DATABASE_ERROR',
                    message: error as string,
                };
            },
        );
    }
}
