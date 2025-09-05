import { request, Variables, RequestDocument } from 'graphql-request';

export async function graphqlRequest<T>(
    endpoint: string,
    query: RequestDocument,
    variables?: Variables,
): Promise<T> {
    await fetch(`${process.env.MAPSWIPE_API_ENDPOINT}health/`, {
        credentials: 'include',
    });

    return request<T>(
        endpoint,
        query,
        variables,
        { credentials: 'include' },
    );
}
