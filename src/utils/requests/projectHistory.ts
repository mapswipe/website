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

const getProjectHistory = async (projectId: string, exportHistoryUrl?: string) => {
	if (!exportHistoryUrl) {
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
	  console.warn(`Could not fetch history for project ${projectId}.`);
	  console.warn(e);
	  return [];
	}

    const parsedContent = await new Promise((resolve, reject) => {
	    Papa.parse(csvContent ?? '', {
      	delimiter: ',',
  	    newline: '\n',
      	header: true,
      	complete: (results: any) => resolve(results),
  	    error: (error: any) => reject(error),
	    });
    });

  const histories = (parsedContent as any).data as ProjectHistoryRaw[];

  return histories
	.filter((row) => !isFalsyString(row.day))
	.map((row): ProjectHistory => ({
  	timestamp: new Date(row.day).getTime(),
  	numberOfResults: Number(row.number_of_results) || 0,
  	numberOfResultsProgress: Number(row.number_of_results_progress) || 0,
  	cumNumberOfResults: Number(row.cum_number_of_results) || 0,
  	cumNumberOfResultsProgress: Number(row.cum_number_of_results_progress) || 0,
  	progress: Number(row.progress) || 0,
  	cumProgress: Number(row.cum_progress) || 0,
  	numberOfUsers: Number(row.number_of_users) || 0,
  	numberOfNewUsers: Number(row.number_of_new_users) || 0,
  	cumNumberOfUsers: Number(row.cum_number_of_users) || 0,
  	projectId: row.project_id,
	}))
	.filter(isDefined);
};

export default getProjectHistory;
