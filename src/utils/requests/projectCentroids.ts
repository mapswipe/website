// import { cache } from 'react';

export type ProjectStatus = 'private_active' | 'private_inactive' | 'private_finished' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';
export type ProjectType = 1 | 2 | 3 | 4;

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
            tile_server_name: string;
            status: ProjectStatus;
            area_sqkm: number | undefined;
            progress: number | undefined;
            number_of_users: number | undefined;
            centroid: string;
        },
        geometry: {
            type: 'Point',
            coordinates: [number, number] | undefined,
        },
    }[],
}

const getProjectCentroids = async () => {
    const projectsResponse = await fetch('https://apps.mapswipe.org/api/projects/projects_centroid.geojson');
    const projects = await projectsResponse.json() as ProjectResponse;

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
};

export default getProjectCentroids;
