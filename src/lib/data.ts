// Build-time data loader. Reads the same fullData/staticData.json the Next app
// reads (symlinked into the worktree). publicProjects.results[] is the project
// array.
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
// Anchor at the build's working directory (repo root) rather than
// import.meta.url: after Vite bundles this module into dist/, a relative
// specifier resolves from the emitted file's location (dist/pages/...) and
// breaks. cwd is stable across dev + bundled build -> fullData/staticData.json.
// MAPSWIPE_DATA_FILE overrides the path (used by the incremental data-change
// benchmark to point at a perturbed copy without touching the shared symlink).
 
const data: any = require(process.env.MAPSWIPE_DATA_FILE ?? join(process.cwd(), 'fullData', 'staticData.json'));

export interface UrlInfo {
  id?: string;
  fileSize?: number;
  mimetype?: string;
  file?: { url?: string | null; name?: string | null } | null;
  modifiedAt?: string;
}

export interface Project {
  id: string;
  firebaseId: string;
  name: string;
  description?: string | null;
  projectType?: string | null;
  status?: string | null;
  region?: string | null;
  progress: number;
  createdAt?: string | null;
  numberOfContributorUsers?: number | null;
  requestingOrganization?: { name?: string | null } | null;
  image?: { file?: { url?: string | null } | null } | null;
  aoiGeometry?: {
    centroid?: [number, number] | number[] | null;
    bbox?: number[][][] | null;
    totalArea?: number | null;
  } | null;
  aoiGeometryInputAsset?: UrlInfo;
  exportAggregatedResults?: UrlInfo;
  exportAggregatedResultsWithGeometry?: UrlInfo;
  exportGroups?: UrlInfo;
  exportHistory?: UrlInfo;
  exportAreaOfInterest?: UrlInfo;
  exportResults?: UrlInfo;
  exportTasks?: UrlInfo;
  exportUsers?: UrlInfo;
  exportHotTaskingManagerGeometries?: UrlInfo;
  exportModerateToHighAgreementYesMaybeGeometries?: UrlInfo;
}

export function getAllProjects(): Project[] {
  const projects = (data?.publicProjects?.results ?? []) as Project[];
  // Test knob: inject a deliberately bad cover URL into the first image-bearing
  // project so we can prove the resolver fails soft to passthrough without
  // killing the build. No-op unless BAD_IMAGE_TEST is set.
  if (process.env.BAD_IMAGE_TEST) {
    const badUrl = process.env.BAD_IMAGE_TEST;
    const target = projects.find((p) => p.image?.file?.url);
    if (target?.image?.file) target.image.file.url = badUrl;
  }
  return projects;
}

export function getProjectByFirebaseId(id: string): Project | undefined {
  return getAllProjects().find((p) => String(p.firebaseId) === String(id));
}

// Home-page key figures. Mirrors the Next home page's
// value?.communityStats?.{totalContributors,totalSwipes}.
export interface CommunityStats {
  totalContributors: number | null;
  totalSwipes: number | null;
}
export function getCommunityStats(): CommunityStats {
  const stats = data?.communityStats ?? {};
  return {
    totalContributors: stats.totalContributors ?? null,
    totalSwipes: stats.totalSwipes ?? null,
  };
}
