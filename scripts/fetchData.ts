// Run with plain `node scripts/fetchData.ts` (Node >= 22 type stripping — the
// type-only import below is erased, so no ts-node/tsc is needed at runtime).
// The GraphQL documents live in scripts/graphql/*.graphql so graphql-codegen
// can parse them (interpolated template literals break its tag plucker); the
// same files are read here at runtime.
import { GraphQLClient } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import type {
    ProjectScanQuery,
    ProjectsByIdsQuery,
    PublicProjectsQuery,
    RestDataQuery,
} from '../generated/types';

const datadir = path.join(import.meta.dirname, '../fullData');
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

const gqlDir = path.join(import.meta.dirname, 'graphql');
const readDoc = (name: string) => fs.readFileSync(path.join(gqlDir, name), 'utf8');
const projectFieldsFragment = readDoc('projectFields.graphql');
const scanQuery = readDoc('projectScan.graphql');
const projectsQuery = `${readDoc('publicProjects.graphql')}\n${projectFieldsFragment}`;
const projectsByIdsQuery = `${readDoc('projectsByIds.graphql')}\n${projectFieldsFragment}`;
const restQuery = readDoc('restData.graphql');

// staticData.json's shape: the singular rest-data plus the project list.
type StaticData = RestDataQuery & Pick<PublicProjectsQuery, 'publicProjects'>;
type PublicProjects = NonNullable<PublicProjectsQuery['publicProjects']>;
type ProjectResult = NonNullable<PublicProjects['results']>[number];

const dummyData: StaticData = {
    publicProjects: { results: [], totalCount: 0 },
    communityStats: {
        id: '0', totalContributors: 1, totalSwipes: 1,
    },
    publicOrganizations: { results: [] },
    globalExportAssets: [],
};

async function fetchAllProjects(): Promise<PublicProjects> {
    const results: ProjectResult[] = [];
    let offset = 0;
    let totalCount = 0;
    for (;;) {
        const page = (await graphQLClient.request(projectsQuery, {
            limit: PROJECTS_PAGE_SIZE, offset,
        })) as PublicProjectsQuery;
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

// A project is considered changed when either timestamp differs: `modifiedAt`
// covers project edits; `lastContributionDate` covers new swipes that update
// progress without bumping `modifiedAt`.
type ChangeKeyFields = { modifiedAt?: string | null; lastContributionDate?: string | null };
function changeSignature(p: ChangeKeyFields): string {
    return `${p.modifiedAt ?? ''}|${p.lastContributionDate ?? ''}`;
}

// Cheap scan → Map<id, changeSignature> of the current published/finished set.
async function scanProjects(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let offset = 0;
    let totalCount = 0;
    for (;;) {
        const page = (await graphQLClient.request(scanQuery, {
            limit: SCAN_PAGE_SIZE, offset,
        })) as ProjectScanQuery;
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
        const page = (await graphQLClient.request(projectsByIdsQuery, {
            ids: batch, limit: PROJECTS_PAGE_SIZE, offset: 0,
        })) as ProjectsByIdsQuery;
        out.push(...(page.publicProjects?.results ?? []));
    }
    return out;
}

// Load the previous run's output as the incremental cache (id + modifiedAt +
// full data). In CI this file is restored from actions/cache before the run.
function loadPreviousProjects(): Map<string, ProjectResult> | null {
    try {
        const prev = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as StaticData;
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
    scan.forEach((_sig, id) => {
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
        console.error('failed to do the healthcheck', healthcheckUrl, err);
    }
    return undefined;
}

async function fetchAndWriteData() {
    let data: StaticData;
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
        const rest = (await graphQLClient.request(restQuery)) as RestDataQuery;
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
