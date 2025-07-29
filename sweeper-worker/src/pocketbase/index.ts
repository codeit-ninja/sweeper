import Pocketbase from 'pocketbase';

export const pocketbase = new Pocketbase('http://127.0.0.1:49230');
await pocketbase.collection('_superusers').authWithPassword('richard@codeit.ninja', 'vnPAB9TaxgMe@c2GVQEX', {
    autoRefreshThreshold: 30 * 60,
});
