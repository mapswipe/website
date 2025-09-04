import { request } from 'graphql-request';
import { ProjectProperties, projectsData, ProjectsData, UrlInfo } from 'pages/queries';
import {
    timeIt,
    memoize,
    ProjectStatus,
    ProjectType,
    parseProjectName,
    supportedProjectTypes,
    graphqlEndpoint,
} from 'utils/common';

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

export interface ProjectResponse {
    type: 'FeatureCollection';
    name: 'projects';
    features: {
        type: 'Feature';
        properties: PropertiesWithName | PropertiesWithLegacyName;
        geometry: {
            type: string;
            coordinates: [ number, number ] | undefined;
        } | null;
    }[];
}

const getProjectCentroids = memoize(async (): Promise<ProjectResponse> => {
	const value: ProjectsData = await request(
    	graphqlEndpoint,
    	projectsData,
    	{
        	includeAll: true,
    	}
	);
    const filteredProjects: ProjectResponse = {
        type: 'FeatureCollection',
        name: 'projects',
        features: await Promise.all(
            value.projects.results
                .filter((feature) => {
                    if (!supportedProjectTypes.includes(feature.projectType)) {
                        return false;
                    }
                    if (
                        feature.projectType !== 'VALIDATE_IMAGE' &&
                        !feature.exportHotTaskingManagerGeometries?.file?.url
                    ) {
                        return false;
                    }
                    return (
                        feature.status === 'READY' ||
                        feature.status === 'ARCHIVED' ||
                        feature.status === 'PUBLISHED' ||
                        feature.status === 'MARKED_AS_READY'
                    );
                })
                .map(async (feature) => {
                    let geometry = null;

                    // 🔑 Fetch geometry from exportHotTaskingManagerGeometries URL
                    if (feature.exportHotTaskingManagerGeometries?.file?.url) {
                        try {
                            const res = await fetch(
                                feature.exportHotTaskingManagerGeometries.file.url
                            );
                            const geojson = await res.json();
                            geometry = geojson.features?.[0]?.geometry ?? null;
                        } catch (err) {
                            console.error(
                                `Failed to fetch geometry for project ${feature.id}`,
                                err
                            );
                        }
                    }

                    const projectName = parseProjectName(feature.name);
                    let { status } = feature;
                    if (status === 'MARKED_AS_READY') {
                        status = 'MARKED_AS_READY';
                    }
                    if (status === 'PUBLISHED') {
                        status = 'PUBLISHED';
                    }

                    const properties: PropertiesWithLegacyName | PropertiesWithName =
                        projectName
                            ? {
                                  ...feature,
                                  ...projectName,
                                  status,
                              }
                            : {
                                  ...feature,
                                  status,
                                  legacyName: true,
                              };

                    return {
                        type: 'Feature',
                        properties,
                        geometry,
                    };
                })
        ),
    };

    return filteredProjects;
});

export default getProjectCentroids;
