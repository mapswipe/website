import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { AllDataQuery } from '../generated/types';

const datadir = path.join(__dirname, '../fullData');
const outputPath = path.join(datadir, 'staticData.json');
const baseUrl = process.env.MAPSWIPE_API_ENDPOINT || 'http://localhost:8000/';
const GRAPHQL_ENDPOINT = `${baseUrl}graphql/`;
// TODO: Validate the app environment env to be 'DEV', 'ALPHA-X' or 'PROD'
const COOKIE_NAME = `MAPSWIPE-${process.env.APP_ENVIRONMENT}-CSRFTOKEN`;
const pipelineType = process.env.PIPELINE_TYPE;

// Full project fetch is paged at 100; the cheap id+modifiedAt scan is paged
// large (tiny rows), so it costs 2-3 requests instead of ~25.
const PROJECTS_PAGE_SIZE = 100;
const SCAN_PAGE_SIZE = 1000;
// Force a full re-fetch (ignore the incremental cache). Use periodically as a
// safety net for changes that don't bump `project.modifiedAt`.
const forceFull = process.env.FORCE_FULL_FETCH === '1' || process.env.FORCE_FULL_FETCH === 'true';

const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT);

const dummyData: AllDataQuery = {
    publicProjects: { results: [], totalCount: 0 },
    communityStats: {
        id: '0', totalContributors: 1, totalUserGroups: 1, totalSwipes: 1,
    },
    publicOrganizations: { results: [] },
    globalExportAssets: [],
};

// Only fields the pages render (see the page slim functions). Shared between the
// full and by-id project queries so the selection can't drift.
const PROJECT_FIELDS = `
    id
    exportAggregatedResultsWithGeometry { id fileSize file { url } mimetype }
    exportAggregatedResults { id fileSize file { url } mimetype }
    exportAreaOfInterest { id fileSize file { url } mimetype }
    exportGroups { id fileSize file { url } mimetype }
    exportHistory { id fileSize file { url } mimetype modifiedAt }
    exportResults { id fileSize file { url } mimetype }
    exportTasks { id fileSize file { url } mimetype }
    exportUsers { id fileSize file { url } mimetype }
    exportHotTaskingManagerGeometries { id fileSize file { url } mimetype }
    exportModerateToHighAgreementYesMaybeGeometries { id fileSize file { url } mimetype }
    name
    firebaseId
    image { file { url } }
    description
    requestingOrganization { id name }
    progress
    status
    projectType
    createdAt
    modifiedAt
    lastContributionDate
    region
    requestingOrganizationId
    numberOfContributorUsers
    aoiGeometry { centroid id totalArea bbox }
    aoiGeometryInputAsset { id fileSize file { url } mimetype }
`;

const STATUS_FILTER = 'status: { inList: [PUBLISHED, FINISHED] }';

// Cheap change-detection scan: id + the two timestamps that signal a change.
// `modifiedAt` covers project edits; `lastContributionDate` covers new swipes/
// contributions that update progress without bumping `modifiedAt`.
const scanQuery = gql`
    query ProjectScan($limit: Int!, $offset: Int!) {
        publicProjects(filters: { ${STATUS_FILTER} }, pagination: { limit: $limit, offset: $offset }) {
            results { id modifiedAt lastContributionDate }
            totalCount
        }
    }
`;

// Full fetch of all projects (cold / forced-full path).
const projectsQuery = gql`
    query PublicProjects($limit: Int!, $offset: Int!) {
        publicProjects(filters: { ${STATUS_FILTER} }, pagination: { limit: $limit, offset: $offset }) {
            results { ${PROJECT_FIELDS} }
            totalCount
        }
    }
`;

// Full fetch restricted to a set of ids (incremental path).
const projectsByIdsQuery = gql`
    query ProjectsByIds($ids: [ID!], $limit: Int!, $offset: Int!) {
        publicProjects(filters: { ${STATUS_FILTER}, id: { inList: $ids } }, pagination: { limit: $limit, offset: $offset }) {
            results { ${PROJECT_FIELDS} }
            totalCount
        }
    }
`;

// The non-project data — small, singular, fetched every run.
const restQuery = gql`
    query RestData {
        communityStats { id totalContributors totalSwipes }
        publicOrganizations(pagination: { limit: 9999 }) { results { id name } }
        globalExportAssets { type lastUpdatedAt fileSize file { url name } }
    }
`;

type PublicProjects = NonNullable<AllDataQuery['publicProjects']>;
type ProjectResult = NonNullable<PublicProjects['results']>[number];

async function fetchAllProjects(): Promise<PublicProjects> {
    const results: ProjectResult[] = [];
    let offset = 0;
    let totalCount = 0;
    for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const page = (await graphQLClient.request(projectsQuery, {
            limit: PROJECTS_PAGE_SIZE, offset,
        })) as AllDataQuery;
        const pageResults = page.publicProjects?.results ?? [];
        totalCount = page.publicProjects?.totalCount ?? totalCount;
        results.push(...pageResults);
        console.log(`  full-fetch projects ${results.length}/${totalCount}`);
        offset += PROJECTS_PAGE_SIZE;
        if (pageResults.length < PROJECTS_PAGE_SIZE || results.length >= totalCount) {
            break;
        }
    }
    return { results, totalCount };
}

// A project is considered changed when either timestamp differs. Note the
// generated `AllDataQuery` type predates `lastContributionDate`; it is present
// at runtime (fetched in both the scan and PROJECT_FIELDS) so reads are safe.
type ChangeKeyFields = { modifiedAt?: string | null; lastContributionDate?: string | null };
function changeSignature(p: ChangeKeyFields): string {
    return `${p.modifiedAt ?? ''}|${p.lastContributionDate ?? ''}`;
}

type ScanRow = { id: string; modifiedAt?: string | null; lastContributionDate?: string | null };
type ScanResponse = {
    publicProjects?: { results?: ScanRow[] | null; totalCount?: number | null } | null;
};

// Cheap scan → Map<id, changeSignature> of the current published/finished set.
async function scanProjects(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let offset = 0;
    let totalCount = 0;
    for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const page = (await graphQLClient.request(scanQuery, {
            limit: SCAN_PAGE_SIZE, offset,
        })) as ScanResponse;
        const pageResults = page.publicProjects?.results ?? [];
        totalCount = page.publicProjects?.totalCount ?? totalCount;
        pageResults.forEach((p) => map.set(p.id, changeSignature(p)));
        offset += SCAN_PAGE_SIZE;
        if (pageResults.length < SCAN_PAGE_SIZE || map.size >= totalCount) {
            break;
        }
    }
    return map;
}

// Full fetch for a specific set of ids, batched by inList.
async function fetchProjectsByIds(ids: string[]): Promise<ProjectResult[]> {
    const out: ProjectResult[] = [];
    for (let i = 0; i < ids.length; i += PROJECTS_PAGE_SIZE) {
        const batch = ids.slice(i, i + PROJECTS_PAGE_SIZE);
        // eslint-disable-next-line no-await-in-loop
        const page = (await graphQLClient.request(projectsByIdsQuery, {
            ids: batch, limit: PROJECTS_PAGE_SIZE, offset: 0,
        })) as AllDataQuery;
        out.push(...(page.publicProjects?.results ?? []));
    }
    return out;
}

// Load the previous run's output as the incremental cache (id + modifiedAt +
// full data). In CI this file is restored from actions/cache before the run.
function loadPreviousProjects(): Map<string, ProjectResult> | null {
    try {
        const prev = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as AllDataQuery;
        const results = prev.publicProjects?.results ?? [];
        if (results.length === 0) {
            return null;
        }
        return new Map(results.map((p) => [p.id, p]));
    } catch {
        return null;
    }
}

async function fetchProjectsIncrementally(): Promise<PublicProjects> {
    const prevById = forceFull ? null : loadPreviousProjects();
    if (!prevById) {
        console.log(forceFull ? 'FORCE_FULL_FETCH set — full fetch' : 'no usable cache — full fetch');
        return fetchAllProjects();
    }

    const scan = await scanProjects();
    const changedIds: string[] = [];
    scan.forEach((sig, id) => {
        const prev = prevById.get(id);
        if (!prev || changeSignature(prev) !== sig) {
            changedIds.push(id);
        }
    });

    const fresh = changedIds.length > 0 ? await fetchProjectsByIds(changedIds) : [];
    const freshById = new Map(fresh.map((p) => [p.id, p]));

    // Assemble in the current scan order; deleted projects (in cache, not in
    // scan) are naturally excluded. Missing new ids (edge race) are dropped.
    const results: ProjectResult[] = [];
    scan.forEach((_modifiedAt, id) => {
        const project = freshById.get(id) ?? prevById.get(id);
        if (project) {
            results.push(project);
        }
    });

    const reused = scan.size - changedIds.length;
    let deleted = 0;
    prevById.forEach((_project, id) => {
        if (!scan.has(id)) {
            deleted += 1;
        }
    });
    console.log(`incremental: ${changedIds.length} changed/new, ${reused} reused, ${deleted} deleted (of ${scan.size} current)`);

    return { results, totalCount: scan.size };
}

async function getCsrfTokenValue() {
    const healthcheckUrl = `${baseUrl}health-check/?format=json`;
    try {
        const healthcheckData = await fetch(healthcheckUrl, { credentials: 'include' });
        const cookiesToSet = (
            healthcheckData.headers as (Headers & { getSetCookie: () => string[] })
        ).getSetCookie();
        const parsedCookiesToSet = cookiesToSet
            .flatMap((item: string) => item.split('; '))
            .map((item: string) => {
                const [key, value] = item.split('=');
                return { key, value } as { key: string, value: string };
            });
        const csrfToken = parsedCookiesToSet.find((item) => item.key === COOKIE_NAME);
        return csrfToken?.value;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('failed to do the healthcheck', healthcheckUrl);
    }
    return undefined;
}

async function fetchAndWriteData() {
    let data = {} as AllDataQuery;
    if (pipelineType === 'ci') {
        data = dummyData;
    } else {
        console.log('Fetching data from GraphQL endpoint from ', GRAPHQL_ENDPOINT);
        const csrfTokenValue = await getCsrfTokenValue();
        if (!csrfTokenValue) {
            console.error('Could not fetch crsf token');
            return;
        }
        const referer = process.env.MAPSWIPE_REFERER_ENDPOINT ?? baseUrl;
        console.log('CSRF Token exists:', !!csrfTokenValue);
        console.log('Referer exists:', !!referer);
        graphQLClient.setHeader('X-CSRFToken', csrfTokenValue);
        graphQLClient.setHeader('Cookie', `${COOKIE_NAME}=${csrfTokenValue}`);
        graphQLClient.setHeader('Referer', referer);

        const publicProjects = await fetchProjectsIncrementally();
        const rest = (await graphQLClient.request(restQuery)) as AllDataQuery;
        data = { ...rest, publicProjects };
    }

    if (!fs.existsSync(datadir)) {
        fs.mkdirSync(datadir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data written to ${outputPath}`);
    console.log(`Top-level keys: ${Object.keys(data ?? {}).join(', ')}`);
    console.log(`Total projects count: ${data?.publicProjects?.totalCount}`);

    const lastModifiedEpoch = Date.now();
    if (process.env.GITHUB_ENV) {
        console.log('Setting MAPSWIPE_API_LAST_MODIFIED_EPOCH in GitHub Actions environment');
        fs.appendFileSync(
            process.env.GITHUB_ENV,
            `MAPSWIPE_API_LAST_MODIFIED_EPOCH=${lastModifiedEpoch}\n`,
        );
    }
}

fetchAndWriteData();
