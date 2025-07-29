import { pocketbase } from './src/pocketbase/index.ts';

pocketbase.collection('sweep_jobs').subscribe('*', (e) => {
    console.log(`Event: ${e.action} on record with ID: ${e.record.id}`);
    console.log('Record data:', e.record);
});
