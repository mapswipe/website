import {
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

export const graphqlEndpoint = process.env.MAPSWIPE_COMMUNITY_API_ENDPOINT as string;

export interface Stats {
    communityStats: {
        totalContributors: number | null | undefined;
        totalSwipes: number | null | undefined;
    } | null | undefined;
}

const matchRegex = /^(?<topic>.+)\s+-\s+(?<region>.+)\((?<taskNumber>\d+)\)\s+(?<requestingOrganization>.+)$/;
interface ParseRes {
    topic: string;
    region: string;
    taskNumber: string;
    requestingOrganization: string;
}
export function parseProjectName(name: string): ParseRes | undefined {
    const match = name.match(matchRegex);
    if (!match) {
        return undefined;
    }
    return match.groups as unknown as ParseRes;
}

export function rankedSearchOnList<T>(
    list: T[],
    searchString: string | undefined,
    labelSelector: (item: T) => string,
) {
    if (isFalsyString(searchString)) {
        return list;
    }

    return list
        .filter((option) => caseInsensitiveSubmatch(labelSelector(option), searchString))
        .sort((a, b) => compareStringSearch(
            labelSelector(a),
            labelSelector(b),
            searchString,
        ));
}

export async function timeIt<R>(_: string, __: string, func: (() => Promise<R>)) {
    // console.log(`START: ${key}: ${header}`);
    // const startTime = new Date().getTime();
    const resp = await func();
    // const endTime = new Date().getTime();
    // console.log(`END: ${key}: Took ${endTime - startTime}ms`);
    return resp;
}

function compareArray<T extends Array<any>>(foo: T, bar: T): boolean {
    if (foo.length !== bar.length) {
        return false;
    }
    for (let i = 0; i < foo.length; i += 1) {
        if (foo[i] !== bar[i]) {
            return false;
        }
    }
    return true;
}

export function memoize<A extends Array<any>, R>(func: (...args: A) => R) {
    let lastArgs: A;
    let lastResponse: R;
    return (...newArgs: A): R => {
        if (lastArgs && compareArray(lastArgs, newArgs)) {
            // console.log('CACHE: hit', lastArgs, newArgs);
            return lastResponse;
        }
        // console.log('CACHE: miss', lastArgs, newArgs);
        lastResponse = func(...newArgs);
        lastArgs = newArgs;
        return lastResponse;
    };
}

export type ProjectStatus = 'private_active' | 'private_inactive' | 'private_finished' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';

export type ProjectType = 1 | 2 | 3 | 4;

export interface ProjectStatusOption {
    key: ProjectStatus;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
}

export interface ProjectTypeOption {
    key: `${ProjectType}`;
    label: string;
    icon?: React.ReactNode;
}

export const projectNameMapping: {
    [key in ProjectTypeOption['key']]: string
} = {
    1: 'Build Area',
    2: 'Footprint',
    3: 'Change Detection',
    4: 'Completeness',
};

const mb = 1024 * 1024;
export function getFileSizeProperties(fileSize: number) {
    if (fileSize > (mb / 10)) {
        return {
            size: fileSize / mb,
            unit: 'megabyte',
        };
    }
    return {
        size: fileSize / 1024,
        unit: 'kilobyte',
    };
}
