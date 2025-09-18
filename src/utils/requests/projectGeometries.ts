import {
    memoize,
    ProjectStatus,
    ProjectType,
    parseProjectName,
} from 'utils/common';
import graphqlRequest from 'utils/requests/graphqlRequest';
import {
    projectsData,
    UrlInfo,
} from 'pages/queries';

import {
    ProjectsQuery,
} from '../../../generated/types';

interface ProjectProperties {
    id: string;
    name: string;
    projectType: ProjectType;
    status: ProjectStatus;
    exportAreaOfInterest: UrlInfo;
}

interface PropertiesWithLegacyName extends ProjectProperties {
    name: string;
    legacyName: true;
}

interface PropertiesWithName extends ProjectProperties {
    topic: string;
    region: string;
    taskNumber: string;
    legacyName?: false;
}

export interface ProjectGeometryResponse {
    type: 'FeatureCollection';
    name: 'projects';
    features: {
        type: 'Feature';
        properties: PropertiesWithName | PropertiesWithLegacyName;
        geometry: GeoJSON.Geometry | null;
    }[];
}

export interface ProjectResponse extends ProjectGeometryResponse {}

async function fetchGeometryFromUrl(url: string): Promise<GeoJSON.Geometry | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch GeoJSON from ${url}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        return data?.features?.[0]?.geometry ?? null;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching geometry:', err);
        return null;
    }
}

const getProjectGeometries = memoize(async (): Promise<ProjectResponse> => {
    const value: ProjectsQuery = await graphqlRequest(projectsData);

    const features = await Promise.all(
        value.publicProjects.results
            .filter((feature) => {
                if (!feature.exportAreaOfInterest?.file?.url) {
                    return false;
                }

                return (
                    feature.status === 'FINISHED'
                    || feature.status === 'PUBLISHED'
                    || feature.status === 'WITHDRAWN'
                );
            })
            .map(async (feature) => {
                const geometry = await fetchGeometryFromUrl(feature?.exportAreaOfInterest.file.url);

                const projectName = parseProjectName(feature.name);
                const { status } = feature;

                const properties: PropertiesWithLegacyName | PropertiesWithName = projectName
                    ? { ...feature, ...projectName, status }
                    : { ...feature, status, legacyName: true };

                return {
                    type: 'Feature' as const,
                    properties,
                    geometry,
                };
            }),
    );

    return {
        type: 'FeatureCollection',
        name: 'projects',
        features,
    };
});

export default getProjectGeometries;
