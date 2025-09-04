import { gql } from 'graphql-request';
import { ProjectStatus, ProjectType } from 'utils/common';

export interface ProjectProperties {
	id: string;
	name: string;
	projectType: ProjectType;
	description?: string | null;
	status?: ProjectStatus;
	createdAt?: string;
	modifiedAt?: string;
	image?: {
    	id: string;
    	file: {
        	name: string;
        	url: string;
    	};
    	createdAt: string;
	};
	requestingOrganizationId?: string;
	progress?: string | null;
	requestingOrganization: {
    	id: string;
    	name: string;
	};
	region?: string | null;
	exportAggregatedResults?: UrlInfo;
	exportAggregatedResultsWithGeometry?: UrlInfo;
	exportGroups?: UrlInfo;
	exportHistory: UrlInfo;
	exportAreaOfInterest?: UrlInfo;
	exportResults?: UrlInfo;
	exportTasks?: UrlInfo;
	exportUsers?: UrlInfo;
    exportHotTaskingManagerGeometries?: UrlInfo;
    coordinates?: [number, number] | undefined;
}

export interface ProjectsData {
    projects: {
        totalCount: number;
        results: ProjectProperties[];
    };
    organizations: {
        results: {
            id: string;
            name: string;
        }[];
    };
    communityStats: {
        totalSwipes?: string;
        totalUserGroups?: string;
        totalContributors?: string;
    }
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


export const organizationsList = gql`
    query Organizations {
        organizations {
            results {
                id
                name
            }
        }
    }
`;

export const projectsData = gql`
    query Projects(
        $includeAll: Boolean!,
        $projectType: ProjectTypeEnum,
        $status: ProjectStatusEnum,
        $requestingOrganizationId: ID,
        $pagination: OffsetPaginationInput
    ) {
        projects(
            includeAll: $includeAll,
            pagination: $pagination,
            filters: {
                projectType: { exact: $projectType },
                status: { exact: $status },
                requestingOrganizationId: { exact: $requestingOrganizationId }
            }
        ) {
            totalCount
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
            }
        }
        organizations {
            results {
                id
                name
            }
        }
        communityStats {
            id
            totalContributors
            totalUserGroups
            totalSwipes
        }
    }
`;

export const projectList = gql`
    query Project($id: ID!) {
        project(id: $id) {
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
        }
    }
`;
