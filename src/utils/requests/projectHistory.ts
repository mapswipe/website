import cachedRequest from 'utils/cachedCsvRequest';

export type ProjectHistory = {
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
} | { day: '' };

const getProjectHistory = async (projectId: string) => {
    const histories = await cachedRequest<ProjectHistory>(
        `https://apps.mapswipe.org/api/history/history_${projectId}.csv`,
        `history_${projectId}.csv.json`,
    );

    return histories;
};

export default getProjectHistory;
