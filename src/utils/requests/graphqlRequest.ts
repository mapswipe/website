import {
    Variables,
    RequestDocument,
    GraphQLClient,
} from 'graphql-request';

// TODO: Validate the app environment env to be 'DEV', 'ALPHA-X' or 'PROD'
const COOKIE_NAME = `MAPSWIPE-${process.env.APP_ENVIRONMENT}-CSRFTOKEN`;
// FIXME: Validate the urls in env
const baseUrl = process.env.MAPSWIPE_API_ENDPOINT;
const apiEndpoint = `${baseUrl}graphql/`;
const graphQLClient = new GraphQLClient(apiEndpoint);

export async function callHealthCheckRequest() {
    const healthcheckUrl = `${baseUrl}health-check/?format=json`;

    const healthcheckdata = await fetch(healthcheckUrl);

    return healthcheckdata;
}

export default async function graphqlRequest<T>(
    query: RequestDocument,
    variables?: Variables,
): Promise<T | null> {
    const healthCheckData = await callHealthCheckRequest();
    const setCookies = 'getSetCookie' in healthCheckData.headers && typeof healthCheckData.headers.getSetCookie === 'function'
        ? healthCheckData.headers.getSetCookie()
        : undefined;

    // FIXME: do a proper parsing
    const csrfTokenValue = setCookies?.[0].split('; ')[0].split('=')[1];

    if (csrfTokenValue) {
        graphQLClient.setHeader('X-CSRFToken', csrfTokenValue);
        graphQLClient.setHeader('Cookie', `${COOKIE_NAME}=${csrfTokenValue}`);
    }

    const data = await graphQLClient.request<T>(query, variables);

    return data;
}
