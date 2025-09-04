import {
    memoize,
    ProjectStatus,
    ProjectType,
    parseProjectName,
    graphqlEndpoint,
} from 'utils/common';
import request from 'graphql-request';
import { projectsData, ProjectsData, UrlInfo } from 'pages/queries';

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
            console.error(`Failed to fetch GeoJSON from ${url}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        return data?.features?.[0]?.geometry ?? null;
    } catch (err) {
        console.error("Error fetching geometry:", err);
        return null;
    }
}

const getProjectGeometries = memoize(async (): Promise<ProjectResponse> => {
    const value: ProjectsData = await request(graphqlEndpoint, projectsData);

    const features = await Promise.all(
        value.projects.results
            .filter((feature) => {
                if (!feature.exportAreaOfInterest?.file?.url) {
                    return false;
                }

                return (
                    feature.status === 'FINISHED' ||
                    feature.status === 'PUBLISHED' ||
                    feature.status === 'WITHDRAWN'
                );
            })
            .map(async (feature) => {
                const geometry = await fetchGeometryFromUrl(feature?.exportAreaOfInterest.file.url);

                const projectName = parseProjectName(feature.name);
                let { status } = feature;

                if (status === 'FINISHED') status = 'FINISHED';
                if (status === 'PUBLISHED') status = 'PUBLISHED';

                const properties: PropertiesWithLegacyName | PropertiesWithName = projectName
                    ? { ...feature, ...projectName, status }
                    : { ...feature, status, legacyName: true };

                return {
                    type: 'Feature' as const,
                    properties,
                    geometry,
                };
            })
    );

    return {
        type: 'FeatureCollection',
        name: 'projects',
        features,
    };
});

export default getProjectGeometries;

