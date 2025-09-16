import { request, Variables, RequestDocument } from 'graphql-request';

export default async function graphqlRequest<T>(
    endpoint: string,
    query: RequestDocument,
    variables?: Variables,
): Promise<T> {
    const baseUrl = process.env.MAPSWIPE_API_ENDPOINT;

    if (!baseUrl) {
        throw new Error('MAPSWIPE_API_ENDPOINT is not defined');
    }

    if (typeof window !== 'undefined') {
        await fetch(`${baseUrl}health/`, { credentials: 'include' });
    }

    return request<T>(
        endpoint,
        query,
        variables,
        { credentials: 'include' },
    );
}
