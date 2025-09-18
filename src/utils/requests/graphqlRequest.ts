import {
    Variables,
    RequestDocument,
    GraphQLClient,
} from 'graphql-request';

// TODO: Fetch these from env
const endpoint = '';

// TODO: Validate the app environment env to be 'DEV', 'ALPHA-X' or 'PROD'
const COOKIE_NAME = `MAPSWIPE-${process.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const referrerEndpoint = process.env.REFERRER_ENDPOINT ?? '';
const baseUrl = process.env.MAPSWIPE_API_ENDPOINT;

export default async function graphqlRequest<T>(
    query: RequestDocument,
    variables?: Variables,
): Promise<T> {
    if (!baseUrl) {
        throw new Error('MAPSWIPE_API_ENDPOINT is not defined');
    }

    console.log('vars', COOKIE_NAME, referrerEndpoint, baseUrl);

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            // ...headers,
            // 'X-CSRFToken': cook ?? '',
            Referer: referrerEndpoint,
        },
    });

    // TODO: Handle query variables here

    if (typeof window !== 'undefined') {
        await fetch(`${baseUrl}health/`, { credentials: 'include' });
    }

    const data = await graphQLClient.request<T>(query, variables);

    return data;

    /*
    return request<T>(
        endpoint,
        query,
        variables,
        { credentials: 'include' },
    );
    */
}
