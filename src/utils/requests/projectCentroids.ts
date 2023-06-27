import util from 'util';
import fs from 'fs';

import {
    timeIt,
    memoize,
    ProjectStatus,
    ProjectType,
    parseProjectName,
} from 'utils/common';

const readFile = util.promisify(fs.readFile);

interface CommonProperties {
    idx: number;
    url: string | undefined;
    project_id: string;
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
    created: string | undefined;
    image: string | undefined;
}

interface PropertiesWithLegacyName extends CommonProperties {
    name: string;
    legacyName: true;
}

interface PropertiesWithName extends CommonProperties {
    topic: string;
    region: string;
    taskNumber: string;
    requestingOrganization: string;
    legacyName?: false;
}

interface RawProjectResponse {
    type: 'FeatureCollection',
    name: 'projects',
    features: {
        type: 'Feature',
        properties: PropertiesWithLegacyName,
        geometry: {
            type: 'Point',
            coordinates: [number, number] | undefined,
        },
    }[],
}

export interface ProjectResponse {
    type: 'FeatureCollection',
    name: 'projects',
    features: {
        type: 'Feature',
        properties: PropertiesWithName | PropertiesWithLegacyName,
        geometry: {
            type: 'Point',
            coordinates: [number, number] | undefined,
        },
    }[],
}

const getProjectCentroids = memoize(async (): Promise<ProjectResponse> => {
    const cacheFileContent = await timeIt(
        'project_centriods',
        'read cache from disk',
        () => readFile('cache/projects_centroid.geojson'),
    );
    const projects = JSON.parse(cacheFileContent.toString()) as RawProjectResponse;

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
                feature.properties.status === 'private_active'
                || feature.properties.status === 'archived'
                || feature.properties.status === 'finished'
                || feature.properties.status === 'active'
            );
        }).map((feature) => {
            const projectName = parseProjectName(feature.properties.name);
            let { status } = feature.properties;
            if (status === 'private_active') {
                status = 'active';
            }
            if (status === 'archived') {
                status = 'finished';
            }

            const properties: PropertiesWithLegacyName | PropertiesWithName = projectName ? {
                ...feature.properties,
                ...projectName,
                status,
            } : {
                ...feature.properties,
                status,
                legacyName: true,
            };

            return {
                ...feature,
                properties,
            };
        }),
    };

    return filteredProjects;
});

export default getProjectCentroids;
