import util from 'util';
import fs from 'fs';

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const location = 'cache';

/*
type Func<T extends Array<any>, R> = (...a: T) => R;
const timeIt = (key: string) =>
<T extends Array, R>(f: Func<T, R>, header: string) =>
async (...args: T): Promise<R> => {
    console.log(`START: ${key}: ${header}`);
    const startTime = new Date().getTime();
    const resp = await f(...args);
    const endTime = new Date().getTime();
    console.log(`END: ${key}: ${header} Took ${endTime - startTime}ms`);
    return resp;
};
*/
async function timeIt<R>(key: string, header: string, func: (() => Promise<R>)) {
    console.log(`START: ${key}: ${header}`);
    const startTime = new Date().getTime();
    const resp = await func();
    const endTime = new Date().getTime();
    console.log(`END: ${key}: Took ${endTime - startTime}ms`);
    return resp;
}

async function fetchJson<T>(url: string, key: string) {
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
        if (lastUpdate > cachedLastUpdate) {
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
                return response.json();
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

export default fetchJson;
