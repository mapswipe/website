import util from 'util';
import fs from 'fs';
import Papa from 'papaparse';

import { timeIt } from 'utils/common';

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

// FIXME: move this to utils
const location = 'cache';

async function fetchCsv<T>(url: string, key: string) {
    const cacheFileName = `${location}/${key}`;
    const cacheMetaFileName = `${location}/${key}.meta`;

    const serverHeadResponse = await timeIt(
        key,
        `get head response from ${url}`,
        () => fetch(url, { method: 'HEAD' }),
    );

    const lastUpdateString = serverHeadResponse.headers.get('last-modified');
    const lastUpdate = lastUpdateString
        ? new Date(lastUpdateString).getTime()
        : new Date().getTime();

    let cachedLastUpdate: number;
    try {
        const cacheFileContent = await timeIt(
            key,
            'read cache meta from disk',
            () => readFile(cacheMetaFileName),
        );

        cachedLastUpdate = new Date(Number(cacheFileContent.toString())).getTime();
    } catch {
        cachedLastUpdate = 0;
    }

    try {
        // one day stale cache is okay
        if (lastUpdate - cachedLastUpdate > 1000 * 60 * 60 * 24) {
            throw Error('Cache expired');
        }

        const cacheFileContent = await timeIt(
            key,
            'read cache from disk',
            () => readFile(cacheFileName),
        );

        return JSON.parse(cacheFileContent.toString()) as T;
    } catch {
        const serverResponse = await timeIt(
            key,
            `get data from ${url}`,
            async () => {
                const response = await fetch(url);
                const responseText = await response.text();

                const value = await new Promise((resolve, reject) => {
                    Papa.parse(responseText, {
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

                return (value as any).data as T;
            },
        );

        await timeIt(
            key,
            'write cache and cache meta to disk',
            () => {
                const promise = Promise.all([
                    writeFile(cacheMetaFileName, String(new Date().getTime())),
                    writeFile(cacheFileName, JSON.stringify(serverResponse)),
                ]);
                return promise;
            },
        );

        return serverResponse as T;
    }
}

export default fetchCsv;
