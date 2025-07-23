import Emittery from 'emittery';
import { watch } from 'runed';

export interface BootableEvents {
    booted: never;
}

export interface Bootable {
    /**
     * Shutdown method to be called when the bootable component is disabled.
     * This method can contain cleanup logic.
     */
    shutdown?(): void;
    /**
     * Indicates whether the bootable component is enabled.
     * When set to true, the `boot` method will be called.
     */
    manualBoot?: boolean;
}

export abstract class Bootable extends Emittery<BootableEvents> {
    /**
     * Indicates whether the bootable component is enabled.
     * When set to true, the `boot` method will be called.
     *
     * @abstract
     * @type {boolean}
     * @memberof Bootable
     */
    abstract enabled: boolean;

    /**
     * Method to be called when the bootable component is initialized.
     * This method should contain the logic to set up the component.
     *
     * @abstract
     * @memberof Bootable
     */
    abstract boot(): Promise<void> | void;

    /**
     * Optional method to be called when the bootable component is shut down.
     * This method can contain cleanup logic.
     *
     * @memberof Bootable
     */
    constructor() {
        super();

        $effect.root(() => {
            watch(
                () => this.enabled,
                () => {
                    if (this.enabled && !this.manualBoot) {
                        this.boot()?.then(() => {
                            this.emit('booted');
                        });
                    } else {
                        this.shutdown?.();
                    }
                },
            );
        });
    }
}
