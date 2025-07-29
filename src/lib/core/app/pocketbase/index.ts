import { Bootable } from '$lib/bootable.svelte';
import type { TypedPocketBase } from './pocketbase';
import PB from 'pocketbase';

export class Pocketbase extends Bootable {
    enabled = true;
    client!: TypedPocketBase;

    async boot() {
        this.client = new PB('http://127.0.0.1:49230') as TypedPocketBase;
        /**
         * Note that using hardcoded credentials does not matter in this case
         * because this program only runs locally and is not exposed to the internet.
         */
        await this.client.collection('_superusers').authWithPassword('richard@codeit.ninja', 'vnPAB9TaxgMe@c2GVQEX', {
            autoRefreshThreshold: 30 * 60,
        });
    }

    shutdown(): void {
        this.client.authStore.clear();
        this.client.cancelAllRequests();
    }
}
