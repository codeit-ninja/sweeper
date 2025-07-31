import type { Endpoints } from '@octokit/types';
import type { SweepJobsResponse } from '@pocketbase/types';
import { bgGreen, green } from '@std/fmt/colors';
import { Octokit } from 'octokit';

export class Github {
    private client: Octokit;

    private maxPages: number = 100;

    constructor(
        readonly token: string,
        readonly job: SweepJobsResponse<string[]>,
    ) {
        this.client = new Octokit({ auth: this.token });
    }

    async start() {
        console.log(bgGreen(`Starting job: ${this.job.id}`));
        const searchQuery = this.job.patterns?.filter(Boolean).join('+OR+');
        console.log(green(`Searching for: ${searchQuery}`));

        this.executeCallback('sk_91b455debc341646af393b6582573e06c70458ce8c0e51d4');
        return;
        // if (!searchQuery) {
        //     return;
        // }

        // const paginatedData = await this.getPaginatedData(searchQuery);

        // for (const item of paginatedData) {
        //     const content = await this.getContent(item);
        //     const match = await this.getMatch(content.content);

        //     if (!match) {
        //         continue;
        //     }

        //     await this.executeCallback(match);
        // }
    }

    getMatch(content: string) {
        const matches: string[] | null = content.match(new RegExp(this.job.matcher.replace(/[\/]|(gm)/g, '')));

        if (!matches) {
            return null;
        }

        return matches[0];
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

            const parsedResponse = await this.parseCodeSearchResponse(response);
            hasNextPage = parsedResponse.hasNextPage;

            if (parsedResponse.hasNextPage && parsedResponse.nextPage) {
                page = parsedResponse.nextPage;
            }

            data = [...data, ...parsedResponse.data];
        }

        return data;
    }

    async getContent(item: Endpoints['GET /search/code']['response']['data']['items'][0]) {
        const {
            data,
        }: {
            data: Extract<Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data'], { type: 'file' }>;
        } = await this.client.request(`GET ${item.url}`);

        return {
            content: atob(data.content),
            repo: data.url as string,
            hash: data.sha,
        };
    }

    private parseCodeSearchResponse(response: Endpoints['GET /search/code']['response']) {
        const { link } = response.headers;

        const hasNextPage = !!link && link.includes(`rel=\"next\"`);
        const nextPageUrl =
            link && link.match(/(?<=<)([\S]*)(?=>; rel="Next")/i)
                ? new URL(link.match(/(?<=<)([\S]*)(?=>; rel="Next")/i)![0])
                : null;
        const nextPage = nextPageUrl && parseInt(nextPageUrl.searchParams.get('page') as string);

        return {
            hasNextPage,
            nextPageUrl,
            nextPage,
            data: response.data.items,
        };
    }

    private async executeCallback(match: string) {
        try {
            // If the callback is stored as a string in the database
            if (this.job.callback) {
                // Create a temporary file with the callback code
                const tempFile = await Deno.makeTempFile({ suffix: '.ts' });
                await Deno.writeTextFile(tempFile, this.job.callback);

                // Import and execute the callback
                const { default: callback } = await import(`file://${tempFile}`);
                const result = await callback(match);

                // Clean up temp file
                //await Deno.remove(tempFile);

                return result;
            }
        } catch (error) {
            console.error(`Error executing callback for job ${this.job.id}:`, error);
        }
    }
}
