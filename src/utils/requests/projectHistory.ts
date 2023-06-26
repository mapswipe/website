import util from 'util';
import fs from 'fs';
import Papa from 'papaparse';
import { isFalsyString, isDefined } from '@togglecorp/fujs';

import { timeIt } from 'utils/common';

export type ProjectHistoryRaw = {
    day: string,
    number_of_results: string, // number
    number_of_results_progress: string, // number
    cum_number_of_results: string, // number
    cum_number_of_results_progress: string, // number
    progress: string, // number
    cum_progress: string, // number
    number_of_users: string, // number
    number_of_new_users: string, // number
    cum_number_of_users: string, // number
    project_id: string;
};

export interface ProjectHistory {
    timestamp: number;
    progress: number;
}
const readFile = util.promisify(fs.readFile);

function isValidHistoryData(hist: ProjectHistoryRaw | { day: '' }): hist is ProjectHistoryRaw {
    if (isFalsyString(hist.day)) {
        return false;
    }

    return true;
}

const getProjectHistory = async (projectId: string) => {
    let cacheFileContent: Buffer;
    try {
        cacheFileContent = await timeIt(
            projectId,
            'read cache from disk',
            () => readFile(`cache/project-history/history_${projectId}.csv`),
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Could not read history file for project ${projectId}.`);
        // eslint-disable-next-line no-console
        console.warn(e);
        return [];
    }

    const parsedContent = await new Promise((resolve, reject) => {
        Papa.parse((cacheFileContent?.toString() ?? ''), {
            delimiter: ',',
            newline: '\n',
            header: true,
            complete: (results: any) => {
                resolve(results);
            },
            error: (error: any) => {
                reject(error);
            },
        });
    });
    const histories = (parsedContent as any).data as (ProjectHistoryRaw | { day: '' })[];

    return histories.filter(isValidHistoryData).map((hist) => {
        if (isFalsyString(hist.cum_progress)) {
            return undefined;
        }

        return {
            timestamp: new Date(hist.day).getTime(),
            progress: Number(hist.cum_progress),
        };
    }).filter(isDefined);
};

export default getProjectHistory;
