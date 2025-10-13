import Papa from 'papaparse';
import { isFalsyString, isDefined } from '@togglecorp/fujs';
import { timeIt } from 'utils/common';

interface ProjectHistoryRaw {
    day: string;
    number_of_results: string;
    number_of_results_progress: string;
    cum_number_of_results: string;
    cum_number_of_results_progress: string;
    progress: string;
    cum_progress: string;
    number_of_users: string;
    number_of_new_users: string;
    cum_number_of_users: string;
    project_id: string;
}

export interface ProjectHistory {
    timestamp: number;
    numberOfResults: number;
    numberOfResultsProgress: number;
    cumNumberOfResults: number;
    cumNumberOfResultsProgress: number;
    progress: number;
    cumProgress: number;
    numberOfUsers: number;
    numberOfNewUsers: number;
    cumNumberOfUsers: number;
    projectId: string;
}

function isValidHistoryData(hist: ProjectHistoryRaw | { day: '' }): hist is ProjectHistoryRaw {
    if (isFalsyString(hist.day)) {
        return false;
    }

    return true;
}

const getProjectHistory = async (projectId: string, exportHistoryUrl?: string) => {
    if (!exportHistoryUrl) {
        // eslint-disable-next-line no-console
        console.warn(`No exportHistoryUrl for project ${projectId}`);
        return [];
    }

    let csvContent: string;
    try {
        csvContent = await timeIt(
            projectId,
            'fetch project history from exportHistory url',
            async () => {
                const res = await fetch(exportHistoryUrl);
                if (!res.ok) {
                    throw new Error(`Failed to fetch history: ${res.status}`);
                }
                return res.text();
            },
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Could not fetch history for project ${projectId}.`);
        return [];
    }

    const parsedContent = await new Promise((resolve, reject) => {
        Papa.parse((csvContent?.toString() ?? ''), {
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

    const histories = (parsedContent as any).data as (ProjectHistoryRaw | { day: '', cum_progress: 0 })[];

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
