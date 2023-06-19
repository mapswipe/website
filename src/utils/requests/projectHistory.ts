import cachedRequest from 'utils/cachedCsvRequest';
import { isFalsyString, isDefined } from '@togglecorp/fujs';

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

function isValidHistoryData(hist: ProjectHistoryRaw | { day: '' }): hist is ProjectHistoryRaw {
    if (isFalsyString(hist.day)) {
        return false;
    }

    return true;
}

const getProjectHistory = async (projectId: string) => {
    const mapswipeApi = process.env.MAPSWIPE_API_ENDPOINT;
    const histories = await cachedRequest<(
    ProjectHistoryRaw | { day: '' })[]
    >(
        `${mapswipeApi}history/history_${projectId}.csv`,
        `history_${projectId}.csv.json`,
        );

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
