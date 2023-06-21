import {
    memoize,
    ProjectStatus,
    ProjectType,
    parseProjectName,
} from 'utils/common';
import cachedRequest from 'utils/cachedJsonRequest';

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
    const mapswipeApi = process.env.MAPSWIPE_API_ENDPOINT;

    const projects = await cachedRequest<RawProjectResponse>(
        `${mapswipeApi}projects/projects_centroid.geojson`,
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

export default getProjectCentroids;
