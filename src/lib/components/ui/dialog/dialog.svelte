<script lang="ts">
    import { Dialog, type DialogRootPropsWithoutHTML, type WithoutChildrenOrChild } from 'bits-ui';
    import { dialog } from './state.svelte';

    type Props = {} & WithoutChildrenOrChild<Omit<DialogRootPropsWithoutHTML, 'open'>>;

    let { ...restProps }: Props = $props();
</script>

<Dialog.Root bind:open={dialog.open} {...restProps}>
    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content class="fixed top-0 left-0 flex h-screen w-screen flex-col overflow-y-auto bg-gray-900">
            <Dialog.Title class="flex items-center justify-between border-b border-gray-700 p-8 text-3xl font-bold">
                {dialog.title}
                <Dialog.Close class="cursor-pointer">
                    <i class="hn hn-window-close-solid"></i>
                </Dialog.Close>
            </Dialog.Title>
            <div class="flex flex-1 flex-col p-8">
                {@render dialog.component?.()}
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
