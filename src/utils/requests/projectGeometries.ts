import { ProjectStatus, ProjectType } from 'utils/common';

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

export interface ProjectGeometryResponse {
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
        geometry: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    }[],
}

const getProjectGeometries = memoize(async () => {
    const projectsResponse = await fetch('https://apps.mapswipe.org/api/projects/projects_geom.geojson');
    const projects = await projectsResponse.json() as ProjectGeometryResponse;

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

export default getProjectGeometries;
