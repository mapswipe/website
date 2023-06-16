import { ProjectStatus, ProjectType } from 'utils/common';
import cachedRequest from 'utils/cachedJsonRequest';

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

function memoize<A extends Array<any>, R>(func: (...args: A) => R) {
    let lastArgs: A;
    let lastResponse: R;
    return (...newArgs: A): R => {
        if (lastArgs && compareArray(lastArgs, newArgs)) {
            return lastResponse;
        }
        lastResponse = func(...newArgs);
        lastArgs = newArgs;
        return lastResponse;
    };
}

export interface ProjectResponse {
    type: 'FeatureCollection',
    name: 'projects',
    features: {
        type: 'Feature',
        properties: {
            idx: number;
            project_id: string;
            name: string;
            project_details: string;
            look_for: string;
            project_type: ProjectType;
            tile_server_names: string;
            status: ProjectStatus;
            area_sqkm: number | undefined;
            centroid: string;
            progress: number | undefined;
            number_of_users: number | undefined;
            number_of_results: number | undefined;
            number_of_results_progress: number | undefined;
            day: string | undefined;
        },
        geometry: {
            type: 'Point',
            coordinates: [number, number] | undefined,
        },
    }[],
}

const getProjectCentroids = memoize(async () => {
    const projects = await cachedRequest<ProjectResponse>(
        'https://apps.mapswipe.org/api/projects/projects_centroid.geojson',
        'projects_centroid.geojson',
    );

    const filteredProjects = {
        ...projects,
        features: projects.features.filter((feature) => {
            if (!feature.geometry) {
                return false;
            }
            if (feature.properties.project_type > 3) {
                return false;
            }
            return (
                feature.properties.status === 'finished'
                || feature.properties.status === 'active'
            );
        }),
    };

    return filteredProjects;
});

export default getProjectCentroids;
