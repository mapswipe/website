import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { AllDataQuery } from '../generated/types';

const datadir = path.join(__dirname, '../fullData');
const baseUrl = process.env.MAPSWIPE_API_ENDPOINT || 'http://localhost:8000/';
const GRAPHQL_ENDPOINT = `${baseUrl}graphql/`;
// TODO: Validate the app environment env to be 'DEV', 'ALPHA-X' or 'PROD'
const COOKIE_NAME = `MAPSWIPE-${process.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const pipelineType = process.env.PIPELINE_TYPE;

const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT);

const dummyData: AllDataQuery = {
    publicProjects: {
        results: [],
        totalCount: 0,
    },
    communityStats: {
        id: '0',
        totalContributors: 1,
        totalUserGroups: 1,
        totalSwipes: 1,
    },
    publicOrganizations: {
        results: [],
    },
    globalExportAssets: [],
};

const query = gql`
    query AllData {
        publicProjects(
            filters: {
                status: {
                    inList: [PUBLISHED, FINISHED, WITHDRAWN],
                },
            },
            pagination: { limit: 9999 },
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
                firebaseId
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
                    bbox
                }
            }
            totalCount
        }
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

async function getCsrfTokenValue() {
    const healthcheckUrl = `${baseUrl}health-check/?format=json`;
    try {
        const healthcheckData = await fetch(healthcheckUrl, { credentials: 'include' });

        const setCookies = 'getSetCookie' in healthcheckData.headers && typeof healthcheckData.headers.getSetCookie === 'function'
            ? healthcheckData.headers.getSetCookie()
            : undefined;

        // FIXME: do a proper parsing
        const token = setCookies?.[0].split('; ')[0].split('=')[1];

        return token;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('failed to do the healthcheck', healthcheckUrl);
    }

    return undefined;
}

async function fetchAndWriteData() {
    let data = {};
    if (pipelineType === 'ci') {
        data = dummyData;
    } else {
        console.log('Fetching data from GraphQL endpoint from ', GRAPHQL_ENDPOINT);

        const csrfTokenValue = await getCsrfTokenValue();
        if (!csrfTokenValue) {
            console.error('Could not fetch crsf token');
            return;
        }
        graphQLClient.setHeader('X-CSRFToken', csrfTokenValue);
        graphQLClient.setHeader('Cookie', `${COOKIE_NAME}=${csrfTokenValue}`);
        graphQLClient.setHeader('Referer', process.env.MAPSWIPE_REFERER_ENDPOINT ?? '');
        data = await graphQLClient.request(query);
    }

    // ensure the `data` directory exists
    if (!fs.existsSync(datadir)) {
        fs.mkdirSync(datadir, { recursive: true });
    }
    const outputPath = path.join(__dirname, '../fullData/staticData.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data written to ${outputPath}`);
    console.log(`Top-level keys: ${Object.keys(data ?? {}).join(', ')}`);

    const lastModifiedEpoch = Date.now();
    if (process.env.GITHUB_ENV) {
        console.log(
            'Setting MAPSWIPE_API_LAST_MODIFIED_EPOCH in GitHub Actions environment',
        );
        fs.appendFileSync(
            process.env.GITHUB_ENV,
            `MAPSWIPE_API_LAST_MODIFIED_EPOCH=${lastModifiedEpoch}\n`,
        );
    }
}

fetchAndWriteData();
