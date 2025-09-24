import { isDefined, isNotDefined } from '@togglecorp/fujs';
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
const graphQLClient = new GraphQLClient(apiEndpoint, {
    /*
    fetch: async (url, options) => {
        console.log('>>> Fetch URL:', options);
        return fetch(url, options);
    },
    */
});

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
let __internal__csrfTokenValue: string;

async function getCsrfTokenValue() {
    if (isDefined(__internal__csrfTokenValue)) {
        return __internal__csrfTokenValue;
    }

    const healthcheckUrl = `${baseUrl}health-check/?format=json`;
    try {
        const healthcheckData = await fetch(healthcheckUrl, { credentials: 'include' });

        const setCookies = 'getSetCookie' in healthcheckData.headers && typeof healthcheckData.headers.getSetCookie === 'function'
            ? healthcheckData.headers.getSetCookie()
            : undefined;

        // FIXME: do a proper parsing
        __internal__csrfTokenValue = setCookies?.[0].split('; ')[0].split('=')[1];

        return __internal__csrfTokenValue;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('failed to do the healthcheck', healthcheckUrl);
    }

    return undefined;
}

export default async function graphqlRequest<T>(
    query: RequestDocument,
    variables?: Variables,
): Promise<T | null> {
    const csrfTokenValue = await getCsrfTokenValue();

    if (isNotDefined(csrfTokenValue)) {
        return null;
    }

    if (csrfTokenValue) {
        graphQLClient.setHeader('X-CSRFToken', __internal__csrfTokenValue);
        graphQLClient.setHeader('Cookie', `${COOKIE_NAME}=${__internal__csrfTokenValue}`);
    }

    const data = await graphQLClient.request<T>(query, variables);

    return data;
}
