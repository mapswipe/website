export type ProjectStatus = 'private_active' | 'private_inactive' | 'private_finished' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';
export type ProjectType = 1 | 2 | 3 | 4;

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
            tile_server_name: string;
            status: ProjectStatus;
            area_sqkm: number | undefined;
            progress: number | undefined;
            number_of_users: number | undefined;
            centroid: string;
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
            if (
                feature.properties.status === 'private_active'
                || feature.properties.status === 'private_inactive'
                || feature.properties.status === 'private_finished'
                || feature.properties.status === 'tutorial'
            ) {
                return false;
            }

            return true;
        }),
    };

    return filteredProjects;
});

export default getProjectGeometries;
