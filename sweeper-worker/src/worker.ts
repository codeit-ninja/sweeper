/// <reference lib="webworker" />
import type { Endpoints } from '@octokit/types';
import type { AppSettings } from './boot.ts';
import { SweepJobsResponse } from '@pocketbase/types';
import { Github } from './github.ts';

type FileContent = Extract<
    Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data'],
    { type: 'file' }
>;

type MessageSettings = {
    type: 'settings';
    payload: AppSettings;
};

type MessageJob = {
    type: 'job';
    payload: SweepJobsResponse<string[]>;
};

let settings: AppSettings;

self.onmessage = (event: MessageEvent<MessageJob | MessageSettings>) => {
    if (event.data.type === 'settings') {
        settings = event.data.payload;
        return;
    }

    new Github(settings.githubAccessToken, event.data.payload).start();
};
