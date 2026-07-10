// Ported from the Next app's src/utils/requests/projectHistory.ts.
// The fujs isFalsyString/isDefined and utils/common timeIt wrappers are
// inlined so the island bundle stays self-contained.
import Papa from 'papaparse';

interface ProjectHistoryRaw {
  day: string;
  cum_progress: string;
}

function isFalsyString(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

const getProjectHistory = async (projectId: string, exportHistoryUrl?: string) => {
  if (!exportHistoryUrl) {
    // eslint-disable-next-line no-console
    console.warn(`No exportHistoryUrl for project ${projectId}`);
    return [];
  }

  let csvContent: string;
  try {
    const res = await fetch(exportHistoryUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch history: ${res.status}`);
    }
    csvContent = await res.text();
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`Could not fetch history for project ${projectId}.`);
    return [];
  }

  const parsedContent = await new Promise<{ data: ProjectHistoryRaw[] }>((resolve, reject) => {
    Papa.parse(csvContent?.toString() ?? '', {
      delimiter: ',',
      newline: '\n',
      header: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (results: any) => resolve(results),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (error: any) => reject(error),
    });
  });

  const histories = parsedContent.data;
  return histories
    .filter((h) => !isFalsyString(h.day))
    .map((hist) => {
      if (isFalsyString(hist.cum_progress)) return undefined;
      return {
        timestamp: new Date(hist.day).getTime(),
        progress: Number(hist.cum_progress),
      };
    })
    .filter((x): x is { timestamp: number; progress: number } => x !== undefined);
};

export default getProjectHistory;
