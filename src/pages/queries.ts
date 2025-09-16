import { gql } from 'graphql-request';
import { ProjectStatus, ProjectType } from 'utils/common';

export interface ProjectProperties {
    id: string;
    name: string;
    projectType: ProjectType;
    description?: string | null;
    status: ProjectStatus;
    createdAt?: number | null;
    modifiedAt?: string | null;
    image: {
        id: string;
        file: {
            name: string;
            url: string;
        };
        createdAt: string;
    };
    requestingOrganizationId?: string;
    progress?: number;
    requestingOrganization: {
        id: string;
        name: string;
    };
    region?: string | null;
    exportAggregatedResults?: UrlInfo;
    exportAggregatedResultsWithGeometry?: UrlInfo;
    exportGroups?: UrlInfo;
    exportHistory?: UrlInfo;
    exportResults?: UrlInfo;
    exportTasks?: UrlInfo;
    exportUsers?: UrlInfo;
    exportAreaOfInterest: UrlInfo;
    exportHotTaskingManagerGeometries?: UrlInfo;
    totalArea: number | null;
    numberOfContributorUsers: number | null;
    aoiGeometry?: {
        id: string;
        centroid: [number, number] | null;
        totalArea: number | null;
    };
}

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
    query Projects($includeAll: Boolean!, $filters: ProjectFilter) {
        publicProjects(
           filters: $filters,
            includeAll: $includeAll
        ) {
            results {
                id
                exportAggregatedResultsWithGeometry {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportAggregatedResults {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportAreaOfInterest {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportGroups {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportHistory {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                    modifiedAt
                }
                exportResults {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportTasks {
                    id
                    fileSize
                    file {
                        name
                        url
                    }
                    mimetype
                }
                exportUsers {
                    id
                    file {
                        url
                        name
                    }
                    mimetype
                    fileSize
                }
                exportHotTaskingManagerGeometries {
                    id
                    file {
                        url
                        name
                    }
                    mimetype
                    fileSize
                }
                exportModerateToHighAgreementYesMaybeGeometries {
                    id
                    file {
                        url
                        name
                    }
                    mimetype
                    fileSize
                }
                name
                image {
                    id
                    file {
                        name
                        url
                    }
                    createdAt
                }
                description
                requestingOrganization {
                    id
                    name
                    modifiedAt
                }
                progress
                status
                projectType
                createdAt
                modifiedAt
                region
                requestingOrganizationId
                numberOfContributorUsers
                totalArea
                aoiGeometry {
                    centroid
                    id
                    totalArea
                }
            }
        }
        communityStats {
            id
            totalContributors
            totalUserGroups
            totalSwipes
        }
        publicOrganizations {
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

export const projectList = gql`
    query Project($id: ID!) {
        publicProject(id: $id) {
            id
            exportAggregatedResultsWithGeometry {
                id
                fileSize
                file {
                    name
                    url
                }
                mimetype
            }
            exportAggregatedResults {
                id
                fileSize
                file {
                    name
                    url
                }
                mimetype
            }
            exportAreaOfInterest {
                id
                file {
                    name
                    url
                }
                fileSize
                mimetype
            }
            exportGroups {
                id
                file {
                    name
                    url
                }
                fileSize
                mimetype
            }
            exportHistory {
                id
                file {
                    url
                    name
                }
                mimetype
                fileSize
                modifiedAt
            }
            exportTasks {
                id
                file {
                    url
                    name
                }
                mimetype
                fileSize
            }
            exportUsers {
                id
                file {
                    name
                    url
                }
                fileSize
                mimetype
            }
            exportResults {
                id
                file {
                    url
                    name
                }
                mimetype
                fileSize
            }
            exportHotTaskingManagerGeometries {
                id
                file {
                    url
                    name
                }
                mimetype
                fileSize
            }
            exportModerateToHighAgreementYesMaybeGeometries {
                id
                file {
                    url
                    name
                }
                mimetype
                fileSize
            }
            name
            image {
                id
                file {
                    name
                    url
                }
                createdAt
            }
            description
            requestingOrganization {
                id
                name
                modifiedAt
            }
            progress
            status
            createdAt
            modifiedAt
            region
            totalArea
            numberOfContributorUsers
            projectType
            requestingOrganizationId
            aoiGeometry {
                bbox
                centroid
                id
                totalArea
            }
        }
    }
`;
