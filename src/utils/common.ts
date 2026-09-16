import {
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';
import { gql } from 'graphql-request';
import { EnumsQuery } from 'generated/types';

export const enumsQuery = gql`
    query Enums {
        enums {
            ProjectTypeEnum {
                key
                label
            }
            ProjectStatusEnum {
                key
                label
            }
        }
    }
`;

// FIXME: Find the value of supported project type
export const supportedProjectTypes = [1, 2, 3, 4, 10, 7];

const cartoKey = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY;
export const baseMapUrl = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoKey ? `?key=${cartoKey}` : ''}`;

export interface Stats {
    communityStats: {
        totalContributors: number | null | undefined;
        totalSwipes: number | null | undefined;
    } | null | undefined;
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

export type ProjectStatus = EnumsQuery['enums']['ProjectStatusEnum'][number]['key'];
export type ProjectType = EnumsQuery['enums']['ProjectTypeEnum'][number]['key'];

export interface ProjectStatusOption {
    key: `${ProjectStatus}`;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
}

export interface ProjectTypeOption {
    key: `${ProjectType}`;
    label: string;
    icon?: React.ReactNode;
}

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
