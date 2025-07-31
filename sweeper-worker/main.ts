// import { pocketbase } from './src/pocketbase/index.ts';

import { white, green, red } from '@std/fmt/colors';
import { Program } from './src/boot.ts';

// pocketbase.collection('sweep_jobs').subscribe('*', (e) => {
//     console.log(`Event: ${e.action} on record with ID: ${e.record.id}`);
//     console.log('Record data:', e.record);
// });

new Program()
    .boot()
    .then(() => {
        console.log(green('Sweeper worker'), white('✅ Application booted successfully.'));
    })
    .catch((error) => {
        console.error(red('Sweeper worker'), white('❌ Error during boot:'), error);
    });
