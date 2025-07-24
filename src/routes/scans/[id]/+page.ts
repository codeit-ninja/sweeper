import { app } from '$core/app';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const scan = await app.database.getTable('scan_jobs').getOne(parseInt(params.id));

    if (scan.isErr()) {
        return error(404, 'Scan not found');
    }

    //await app.database.getTable('scan_jobs').update({ startedAt: null }, { id: scan.value.id });
    // const scan2 = await app.database.getTable('scan_jobs').getOne(parseInt(params.id));

    // console.log(scan2.isOk() ? scan2.value : 'Scan not found after update');
    //await app.database.getTable('scan_hits').deleteMany({ jobId: scan.value.id });
    const hits = await app.database.getTable('scan_hits').getMany({ jobId: scan.value.id });

    return {
        scan: scan.value,
        hits: hits.isOk() ? hits.value : [],
    };
};
