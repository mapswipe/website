import { memoize, ProjectStatus, ProjectType } from 'utils/common';
import cachedRequest from 'utils/cachedJsonRequest';

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
    const mapswipeApi = process.env.MAPSWIPE_API_ENDPOINT;
    const projects = await cachedRequest<ProjectGeometryResponse>(
        `${mapswipeApi}projects/projects_geom.geojson`,
        'projects_geom.geojson',
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

export default getProjectGeometries;
