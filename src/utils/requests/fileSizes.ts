import util from 'util';
import fs from 'fs';
import Papa from 'papaparse';
import { listToMap } from '@togglecorp/fujs';

import {
    memoize,
    timeIt,
} from 'utils/common';

export type FileSize = {
    endpoints: string;
    size_bytes: number;
};

const readFile = util.promisify(fs.readFile);

const getFileSizes = memoize(async () => {
    const cacheFileContent = await timeIt(
        'overall_endpoints',
        'read cache from disk',
        () => readFile('cache/overall-endpoints.csv'),
    );
    const parsedContent = await new Promise((resolve, reject) => {
        Papa.parse(cacheFileContent.toString(), {
            delimiter: ',',
            newline: '\r\n',
            header: true,
            complete: (results: any) => {
                resolve(results);
            },
            error: (error: any) => {
                reject(error);
            },
        });
    });
    const fileSizesByEndpoint = (parsedContent as any).data as FileSize[];
    if (fileSizesByEndpoint.length <= 0) {
        return undefined;
    }
    return listToMap(
        fileSizesByEndpoint,
        (item) => item.endpoints,
        (item) => item.size_bytes,
    );
});

export default getFileSizes;
