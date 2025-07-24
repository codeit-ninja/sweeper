import type { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { User } from '@elevenlabs/elevenlabs-js/api';

type FileContent = Extract<
    Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data'],
    { type: 'file' }
>;

export class Sweeper {
    client: Octokit;

    constructor(
        readonly token: string,
        readonly jobId: number,
        readonly matcher: string,
        readonly patterns: string[],
        readonly maxPages: number = 100,
    ) {
        this.client = new Octokit({ auth: this.token });
    }

    async start() {
        for (const pattern of this.patterns) {
            const paginatedData = await this.getPaginatedData(pattern);

            for (const item of paginatedData) {
                const content = await this.getContent(item);
                const user = await this.getKeys(content.content);

                if (!user) {
                    continue;
                }

                postMessage({
                    type: 'hit',
                    payload: {
                        jobId: this.jobId,
                        content: content.content,
                        repo: content.repo,
                        keys: user,
                        hash: content.hash,
                    },
                });
            }
        }
    }

    async getPaginatedData(pattern: string) {
        let page = 1;
        let hasNextPage = true;
        let data: Endpoints['GET /search/code']['response']['data']['items'][0][] = [];

        while (hasNextPage && page <= this.maxPages) {
            const response = await this.client.rest.search.code({
                q: pattern,
                per_page: 100,
                page,
            });

            const parsedResponse = await parseCodeSearchResponse(response);
            hasNextPage = parsedResponse.hasNextPage;

            if (parsedResponse.hasNextPage && parsedResponse.nextPage) {
                page = parsedResponse.nextPage;
            }

            data = [...data, ...parsedResponse.data];
        }

        return data;
    }

    async getContent(item: Endpoints['GET /search/code']['response']['data']['items'][0]) {
        const { data }: { data: FileContent } = await this.client.request(`GET ${item.url}`);

        return {
            content: atob(data.content),
            repo: data.url as string,
            hash: data.sha,
        };
    }

    async getKeys(content: string) {
        let keys: string[] | null = content.match(new RegExp(this.matcher.replace(/[\/]|(gm)/g, '')));
        let validatedKeys: (User & { keys: string[] })[] = [];

        if (!keys) {
            return null;
        }
        console.log('Found keys:', keys[0]);

        for await (const apiKey of keys) {
            const user = await getElevenlabsProfileForKey(apiKey);

            if (!user) {
                continue;
            }

            validatedKeys.push({ ...user, keys: keys });
        }

        return validatedKeys.length ? validatedKeys : null;
    }
}

export async function parseCodeSearchResponse(response: Endpoints['GET /search/code']['response']) {
    const { link } = response.headers;

    let hasNextPage = !!link && link.includes(`rel=\"next\"`);
    let nextPageUrl =
        link && link.match(/(?<=<)([\S]*)(?=>; rel="Next")/i)
            ? new URL(link.match(/(?<=<)([\S]*)(?=>; rel="Next")/i)![0])
            : null;
    let nextPage = nextPageUrl && parseInt(nextPageUrl.searchParams.get('page') as string);

    return {
        hasNextPage,
        nextPageUrl,
        nextPage,
        data: response.data.items,
    };
}

export async function getElevenlabsProfileForKey(apiKey: string) {
    try {
        const elevenlabs = new ElevenLabsClient({ apiKey });
        const user = await elevenlabs.user.get();

        return user;
    } catch (_) {
        return null;
    }
}
