import { gql } from 'graphql-request';

export interface GlobalExportAssets {
    type: string;
    lastUpdatedAt: string;
    fileSize: number;
    file: {
        name: string;
        url: string;
    };
}

export interface UrlInfo {
    id: string;
    fileSize: number;
    file: {
        url: string;
        name: string;
    };
    mimetype: string;
    modifiedAt?: string;
}

export interface Feature {
    type: 'Feature';
    geometry: {
        type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString' | string;
        coordinates: [number, number] | undefined;
    };
    properties: {
        [key: string]: any;
    } | null;
}

export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
}

export const projectsData = gql`
    query PublicProjects {
        communityStats {
            id
            totalContributors
            totalUserGroups
            totalSwipes
        }
        publicOrganizations(pagination: { limit: 9999 }) {
            results {
                id
                name
            }
        }
        globalExportAssets {
            type
            lastUpdatedAt
            fileSize
            file {
                url
                name
            }
        }
    }
`;
