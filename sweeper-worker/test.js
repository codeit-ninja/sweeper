import { ElevenLabsClient } from 'https://esm.sh/@elevenlabs/elevenlabs-js';

export default async (apiKey) => {
    console.log(apiKey);

    try {
        const client = new ElevenLabsClient({ apiKey });
        const user = await client.user.get();

        console.log(user.subscription.tier);
    } catch (_) {}
};
