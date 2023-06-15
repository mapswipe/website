import {
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

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

export type ProjectStatus = 'private_active' | 'private_inactive' | 'private_finished' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';

export type ProjectType = 1 | 2 | 3 | 4;

export interface ProjectStatusOption {
    key: ProjectStatus;
    label: string;
}

export interface ProjectTypeOption {
    key: `${ProjectType}`;
    label: string;
}

export const projectStatuses: ProjectStatusOption[] = [
    { key: 'active', label: 'Active' },
    { key: 'finished', label: 'Finished' },
];

export const projectTypes: ProjectTypeOption[] = [
    { key: '1', label: 'Build Area' },
    { key: '2', label: 'Footprint' },
    { key: '3', label: 'Change Detection' },
];

export const projectNameMapping: {
    [key in ProjectTypeOption['key']]: string
} = {
    1: 'Build Area',
    2: 'Footprint',
    3: 'Change Detection',
    4: 'Completeness',
};
