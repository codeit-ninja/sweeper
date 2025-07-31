import { Bootable } from '$lib/bootable.svelte';
import { useDebounce, watch } from 'runed';
import { app } from '.';

export interface AppSettings {
    githubAccessToken: string;
    maxWorkers: number;
}

export class Settings extends Bootable {
    enabled = true;

    /**
     * Settings for the application.
     * Define default values here.
     */
    settings: AppSettings = $state({
        githubAccessToken: '',
        maxWorkers: 4,
    });

    constructor() {
        super();

        const updateSettings = useDebounce(
            () => {
                for (const [key, value] of Object.entries(this.settings)) {
                    app.pocketbase.client.collection('settings').update(key, { value });
                }
            },
            () => 500,
        );

        $effect.root(() => {
            watch(
                () => $state.snapshot(this.settings),
                () => updateSettings() as never,
            );
        });
    }

    async boot() {
        const settings = await app.pocketbase.client.collection('settings').getFullList({ fields: 'id,value' });
        console.log(settings);
        for (const setting of settings) {
            if (setting.id in this.settings) {
                this.settings[setting.id as keyof AppSettings] = setting.value as never;
            }
        }
    }
}
