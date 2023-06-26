import util from 'util';
import fs from 'fs';

import {
    memoize,
    ProjectStatus,
    ProjectType,
    timeIt,
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

interface RawProjectGeometryResponse {
    type: 'FeatureCollection',
    name: 'projects',
    features: {
        type: 'Feature',
        properties: PropertiesWithLegacyName,
        geometry: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    }[],
}

export interface ProjectGeometryResponse {
    type: 'FeatureCollection',
    name: 'projects',
    features: {
        type: 'Feature',
        properties: PropertiesWithName | PropertiesWithLegacyName,
        geometry: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    }[],
}

const getProjectGeometries = memoize(async (): Promise<ProjectGeometryResponse> => {
    const cacheFileContent = await timeIt(
        'project_geom',
        'read cache from disk',
        () => readFile('cache/projects_geom.geojson'),
    );
    const projects = JSON.parse(cacheFileContent.toString()) as RawProjectGeometryResponse;

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
        }).map((feature) => {
            const projectName = parseProjectName(feature.properties.name);

            const properties: PropertiesWithLegacyName | PropertiesWithName = projectName ? {
                ...feature.properties,
                ...projectName,
            } : {
                ...feature.properties,
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

export default getProjectGeometries;
