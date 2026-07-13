// Static file endpoint: emits the ONE locale-independent data-explorer dataset
// as /data-explorer.json at build time.
//
// The 6 /<locale>/data/ pages would otherwise each inline the full serialized
// ~2.4k-project payload (~3 MB of HTML apiece); the dataset is
// locale-independent, so it ships once and the DataExplorer island fetches it
// on mount (dataUrl prop). The URL is deliberately NOT content-hash
// cache-busted: GH Pages serves with a ~10-minute cache and the site deploys
// ~daily, so a worst-case 10-minute skew is tolerable.
//
// Shape: { miniProjects, organizations, imageMap } — everything bulky the
// island needs. imageMap is {originalCoverUrl -> optimized /_img src},
// resolved through the SAME build-time fail-soft optimizer as the SSR'd cards
// (scripts/prefetch-images.mjs warmed these exact URLs at COVER_WIDTH before
// the build, so these are pure cache hits).
import type { APIRoute } from 'astro';
import { getDataExplorerPayload } from '../lib/dataExplorer';
import { resolveRemoteImage, COVER_WIDTH } from '../lib/remoteImages';

export const GET: APIRoute = async () => {
  const payload = getDataExplorerPayload();

  const uniqueUrls = [...new Set(
    payload.projects.map((p) => p.image?.file?.url).filter((u): u is string => Boolean(u)),
  )];
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => {
      const { src } = await resolveRemoteImage(url, { width: COVER_WIDTH });
      return [url, src] as const;
    }),
  );
  const imageMap = Object.fromEntries(entries);

  return new Response(
    JSON.stringify({
      miniProjects: payload.projects,
      organizations: payload.organizations,
      imageMap,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
