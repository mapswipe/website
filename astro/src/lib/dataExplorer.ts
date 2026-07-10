// Build-time payload builder for the data-explorer page. Faithful port of the
// Next page's getPageData() (src/pages/[locale]/data/index.tsx): slims the full
// project list to the fields the explorer consumes, plus organizations, global
// export assets, and community stats. Locale-independent (numbers/ids only) —
// the createdAt/modifiedAt strings are locale-neutral toLocaleDateString output
// exactly as the Next page produced them.
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
// Same anchor as src/lib/data.ts (cwd = astro/), stable after Vite bundling.
// MAPSWIPE_DATA_FILE overrides the path (incremental data-change benchmark).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = require(process.env.MAPSWIPE_DATA_FILE ?? join(process.cwd(), '..', 'fullData', 'staticData.json'));

export interface MiniProject {
  id: string;
  projectType: string | null;
  name: string;
  firebaseId: string;
  status: string | null;
  region: string | null;
  requestingOrganizationId: string | null;
  requestingOrganization: { id: string; name: string } | null;
  progress: number;
  numberOfContributorUsers: number | null;
  // Locale-neutral date string (as produced by the Next page). Used for
  // date-range filtering (string compare) and card display.
  createdAt: string | null;
  image: { file: { url: string } } | null;
  // Only centroid (map markers) + totalArea (bubble sizing / area sum) kept;
  // the heavy bbox geometry is dropped to keep the payload small.
  aoiGeometry: { centroid: number[] | null; totalArea: number | null } | null;
  modifiedAt: string | null;
}

export interface Organization {
  id: string;
  name: string;
}

export interface ExportAsset {
  type: string;
  fileSize: number;
  file: { url: string };
}

export interface DataExplorerPayload {
  projects: MiniProject[];
  minArea: number;
  maxArea: number;
  minContributors: number;
  maxContributors: number;
  buildDate: string | null;
  totalContributors: number | null;
  totalSwipes: number | null;
  organizations: Organization[];
  globalExportAssets: ExportAsset[];
}

const isDefined = <T>(v: T | null | undefined): v is T => v !== null && v !== undefined;

// compareDate parity with @togglecorp/fujs: compares two date-ish strings,
// nulls sort last. direction -1 => descending. Returns -1/0/1 * direction.
function compareDate(a: string | null, b: string | null, direction = 1): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (ta < tb) return -1 * direction;
  if (ta > tb) return 1 * direction;
  return 0;
}

function formatDate(value: string | null | undefined): string | null {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
}

export function getDataExplorerPayload(): DataExplorerPayload {
  const buildDate = process.env.MAPSWIPE_BUILD_DATE ?? null;

  const { communityStats, publicOrganizations, globalExportAssets } = data ?? {};
  const { totalContributors = null, totalSwipes = null } = communityStats ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let publicProjects: any[] = data?.publicProjects?.results ?? [];
  const limit = Number(process.env.SLICE_LIMIT ?? 0);
  if (limit > 0) publicProjects = publicProjects.slice(0, limit);

  const miniProjects: MiniProject[] = publicProjects.map((feature) => ({
    id: feature.id ?? '',
    projectType: feature.projectType ?? null,
    name: feature.name,
    firebaseId: feature.firebaseId,
    status: feature.status ?? null,
    region: feature.region ?? null,
    requestingOrganizationId: feature.requestingOrganization?.id ?? null,
    requestingOrganization: feature.requestingOrganization
      ? { id: feature.requestingOrganization.id, name: feature.requestingOrganization.name }
      : null,
    progress: feature.progress,
    numberOfContributorUsers: feature.numberOfContributorUsers ?? null,
    createdAt: formatDate(feature.createdAt),
    image: feature.image?.file?.url ? { file: { url: feature.image.file.url } } : null,
    aoiGeometry: feature.aoiGeometry
      ? { centroid: feature.aoiGeometry.centroid ?? null, totalArea: feature.aoiGeometry.totalArea ?? null }
      : null,
    modifiedAt: formatDate(feature.modifiedAt),
  }));

  const contributors = miniProjects.map((p) => p.numberOfContributorUsers).filter(isDefined);
  const minContributors = contributors.length > 0 ? Math.min(...contributors) : 0;
  const maxContributors = contributors.length > 0 ? Math.max(...contributors) : 0;

  const sortedProjects = [...miniProjects];
  sortedProjects.sort((a, b) => compareDate(a.createdAt, b.createdAt, -1));

  const areas = miniProjects.map((p) => p.aoiGeometry?.totalArea).filter(isDefined);
  const minArea = areas.length > 0 ? Math.min(...areas) : 0;
  const maxArea = areas.length > 0 ? Math.max(...areas) : 0;

  return {
    projects: sortedProjects,
    minArea,
    maxArea,
    minContributors,
    maxContributors,
    buildDate,
    totalContributors,
    totalSwipes,
    organizations: (publicOrganizations?.results ?? []) as Organization[],
    globalExportAssets: (globalExportAssets ?? []) as ExportAsset[],
  };
}
