import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Suspense,
  lazy,
} from 'react';

import ProjectTypeIcon from './ProjectTypeIcon';
import type { MiniProject, Organization, ExportAsset } from '../lib/dataExplorer';

// Leaflet touches window at import time and cannot SSR. We lazy-load the map
// module via a dynamic import() so its (leaflet) top-level code only runs in the
// browser — the parent defers rendering behind a post-mount flag. This mirrors
// the Next page's dynamic(() => import('ProjectsMap'), { ssr: false }).
const ProjectsMapIsland = lazy(() => import('./ProjectsMapIsland'));

// ---------------------------------------------------------------------------
// The ENTIRE interactive region of the data-explorer page as ONE React island.
// Filters + text search + sort (implicit: pre-sorted desc by createdAt) +
// pagination + the card list + the leaflet map all share this component's
// state, so the filters drive BOTH the map and the list (the non-negotiable
// shared-state requirement).
//
// SSR: mounted with client:load, so filters + the initial card list are in the
// server-rendered HTML (SEO, no blank page). Leaflet cannot SSR, so ONLY the
// map is guarded behind a `mounted` flag set in useEffect — it renders on the
// client after hydration without breaking SSR. This mirrors the Next page's
// dynamic(ssr:false) map inside an otherwise-SSR'd page.
//
// DATA: only the first PAGE_SIZE projects (the SSR'd cards) arrive as props;
// the full ~2.4k-project dataset + organizations + cover-image map is a
// SHARED, locale-independent /data-explorer.json fetched on mount (see
// src/pages/data-explorer.json.ts — inlining it into every locale's HTML would
// cost ~3 MB apiece). While loading, the initial cards render and the filter
// inputs are disabled (loading flag); filters/search/map operate on the full
// dataset once it arrives. Fail-soft: if the fetch fails we keep the initial
// slice and warn.
// ---------------------------------------------------------------------------

export const PAGE_SIZE = 9;

// --- Inlined @togglecorp/fujs helpers (fujs isn't a dep of the astro app; we
// avoid adding it just for these tiny functions) --------------------------
function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}
function bound(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
function sum(list: number[]): number {
  return list.reduce((acc, v) => acc + v, 0);
}
function listToMap<T, V>(
  list: T[],
  keySelector: (item: T) => string,
  valueSelector: (item: T) => V,
): Record<string, V> {
  const out: Record<string, V> = {};
  for (const item of list) out[keySelector(item)] = valueSelector(item);
  return out;
}
function compareDate(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  return ta < tb ? -1 : ta > tb ? 1 : 0;
}
function caseInsensitiveSubmatch(text: string | undefined, search: string): boolean {
  return (text ?? '').toLowerCase().includes(search.toLowerCase());
}
function compareStringSearch(a: string, b: string, search: string): number {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  const s = search.toLowerCase();
  return (la.indexOf(s)) - (lb.indexOf(s));
}
// Faithful port of utils/common#rankedSearchOnList.
function rankedSearchOnList<T>(
  list: T[],
  searchString: string | undefined,
  labelSelector: (item: T) => string,
): T[] {
  if (!searchString || searchString.trim() === '') return list;
  return list
    .filter((option) => caseInsensitiveSubmatch(labelSelector(option), searchString))
    .sort((a, b) => compareStringSearch(labelSelector(a), labelSelector(b), searchString));
}
function getFileSizeProperties(fileSize: number) {
  const mb = 1024 * 1024;
  if (fileSize > mb / 10) return { size: fileSize / mb, unit: 'megabyte' };
  return { size: fileSize / 1024, unit: 'kilobyte' };
}

// --- Tiny i18n interpolation. The .astro frontmatter hands us the raw template
// strings for the `data` namespace; here we resolve `{{name}}`, `{{name,
// number}}` and `{{name, datetime}}` placeholders using Intl (matching the Next
// app's i18next number/datetime formatting) -------------------------------
type Dict = Record<string, string>;
function makeT(dict: Dict) {
  return function t(key: string, params?: Record<string, unknown>): string {
    let str = dict[key] ?? key;
    if (params) {
      str = str.replace(/\{\{\s*([^},]+?)\s*(?:,\s*(number|datetime))?\s*\}\}/g, (_m, name, fmt) => {
        const raw = params[name as string];
        if (raw === undefined || raw === null) return '';
        if (fmt === 'number' && typeof raw === 'number') {
          return new Intl.NumberFormat().format(raw);
        }
        if (fmt === 'datetime') {
          const d = raw instanceof Date ? raw : new Date(String(raw));
          if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
          return String(raw);
        }
        return String(raw);
      });
    }
    return str;
  };
}

// --- Debounce hook (parity with hooks/useDebouncedValue) ------------------
function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const PROJECT_TYPES = ['FIND', 'VALIDATE', 'COMPARE', 'COMPLETENESS', 'VALIDATE_IMAGE', 'STREET', 'LOCATE'] as const;

// Shape of the shared /data-explorer.json emitted at build time by
// src/pages/data-explorer.json.ts.
interface DataExplorerDataset {
  miniProjects: MiniProject[];
  organizations: Organization[];
  imageMap: Record<string, string>;
}

interface Props {
  dict: Dict;
  // {originalCoverUrl -> optimized (or passthrough) src} for the INITIAL slice
  // only, resolved at build time by the fail-soft optimizer; the full map
  // arrives with the fetched dataset.
  imageMap: Record<string, string>;
  // First PAGE_SIZE projects, SSR'd for SEO / no blank page.
  initialProjects: MiniProject[];
  // Total project count (the fetched dataset's length) — lets the summary line
  // show the real count while the dataset is still loading.
  totalCount: number;
  // URL of the shared locale-independent dataset JSON.
  dataUrl: string;
  globalExportAssets: ExportAsset[];
  minArea: number;
  maxArea: number;
  minContributors: number;
  maxContributors: number;
  totalContributors: number | null;
  totalSwipes: number | null;
  buildDate: string | null;
}

export default function DataExplorer(props: Props) {
  const {
    dict,
    imageMap: initialImageMap,
    initialProjects,
    totalCount,
    dataUrl,
    globalExportAssets,
    minArea,
    maxArea,
    minContributors,
    maxContributors,
    totalContributors,
    totalSwipes,
    buildDate,
  } = props;

  const t = useMemo(() => makeT(dict), [dict]);

  // client-guard for the (non-SSR-able) leaflet map only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Full dataset, fetched on mount from the shared locale-independent JSON.
  // Initial state mirrors the SSR'd props so hydration matches the static
  // HTML. `loading` starts true (also in the SSR'd HTML — filter inputs render
  // disabled until the data they filter has arrived).
  const [projects, setProjects] = useState<MiniProject[]>(initialProjects);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>(initialImageMap);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DataExplorerDataset>;
      })
      .then((dataset) => {
        if (cancelled) return;
        setProjects(dataset.miniProjects ?? []);
        setOrganizations(dataset.organizations ?? []);
        // Merge over the initial map so the already-rendered cards never lose
        // their resolved src even if the fetched map were somehow partial.
        setImageMap((prev) => ({ ...prev, ...(dataset.imageMap ?? {}) }));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Fail-soft: keep showing the SSR'd initial slice.
        // eslint-disable-next-line no-console
        console.warn(`data-explorer: failed to load ${dataUrl}; showing the initial ${initialProjects.length} projects only`, err);
        setLoading(false);
      });
    return () => { cancelled = true; };
    // dataUrl is a build-time constant; initialProjects only feeds the warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  const [items, setItems] = useState(PAGE_SIZE);
  const [searchText, setSearchText] = useState('');
  const [locationSearchText, setLocationSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<string[]>([]);
  const [bubble, setBubble] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');

  const debouncedSearchText = useDebouncedValue(searchText);
  const debouncedLocationSearchText = useDebouncedValue(locationSearchText);

  const typeLabels = useMemo<Record<string, string>>(() => ({
    FIND: t('type-find-title'),
    VALIDATE: t('type-validate-title'),
    COMPARE: t('type-compare-title'),
    COMPLETENESS: t('type-completeness-title'),
    VALIDATE_IMAGE: t('type-validate-image-title'),
    STREET: t('type-streets-view-title'),
    LOCATE: t('type-locate-title'),
  }), [t]);
  const statusLabels = useMemo<Record<string, string>>(() => ({
    PUBLISHED: t('active'),
    FINISHED: t('finished'),
  }), [t]);

  const toggleInList = useCallback((list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value], []);

  const visibleProjects = useMemo(() => {
    let filtered = projects;
    if (projectStatuses.length > 0) {
      filtered = filtered.filter((p) => p.status !== null && projectStatuses.includes(p.status));
    }
    if (projectTypes.length > 0) {
      filtered = filtered.filter((p) => projectTypes.includes(String(p.projectType)));
    }
    if (dateFrom) {
      filtered = filtered.filter((p) => compareDate(p.createdAt, dateFrom) >= 0);
    }
    if (dateTo) {
      filtered = filtered.filter((p) => compareDate(dateTo, p.createdAt) >= 0);
    }
    if (organization) {
      filtered = filtered.filter((p) => p.requestingOrganizationId === organization);
    }
    if (debouncedLocationSearchText) {
      filtered = rankedSearchOnList(filtered, debouncedLocationSearchText, (p) => p.region ?? '');
    }
    if (debouncedSearchText) {
      filtered = rankedSearchOnList(filtered, debouncedSearchText, (p) => p.name);
    }
    return filtered;
  }, [
    projects, projectStatuses, projectTypes, dateFrom, dateTo, organization,
    debouncedLocationSearchText, debouncedSearchText,
  ]);

  const handleSeeMore = useCallback(() => {
    setItems((n) => bound(n + PAGE_SIZE, 0, projects.length));
  }, [projects.length]);

  const totalAreaSum = sum(visibleProjects.map((p) => p.aoiGeometry?.totalArea ?? 0).filter(isDefined));
  const roundedTotalArea = Math.round(totalAreaSum / 1000) * 1000;
  const tableProjects = visibleProjects.slice(0, items);

  const radiusSelector = useCallback((project: MiniProject) => {
    if (bubble === 'area') {
      return 4 + 16 * (((project.aoiGeometry?.totalArea ?? 0) - minArea) / (maxArea - minArea || 1));
    }
    if (bubble === 'contributors') {
      return 4 + 16 * (((project.numberOfContributorUsers ?? 0) - minContributors) / (maxContributors - minContributors || 1));
    }
    return 4;
  }, [bubble, maxArea, minArea, maxContributors, minContributors]);

  const handleClearFilters = useCallback(() => {
    setProjectStatuses([]);
    setOrganization('');
    setSearchText('');
    setDateFrom('');
    setDateTo('');
    setProjectTypes([]);
    setLocationSearchText('');
  }, []);

  const filtersApplied = !!(
    searchText || dateFrom || locationSearchText || dateTo ||
    organization || projectTypes.length > 0 || projectStatuses.length > 0
  );

  const assetConfig: Record<string, { heading: string; description: string; fileLabel: string }> = {
    PROJECTS_CSV: {
      heading: t('download-projects-overview-heading'),
      description: t('download-projects-overview-description'),
      fileLabel: 'CSV',
    },
    PROJECT_STATS_BY_TYPES: {
      heading: t('download-projects-csv-heading'),
      description: t('download-projects-csv-description'),
      fileLabel: 'CSV',
    },
    PROJECTS_CENTROID_GEOJSON: {
      heading: t('download-projects-with-centroid-heading'),
      description: t('download-projects-with-centroid-description'),
      fileLabel: 'GEOJSON',
    },
    PROJECTS_GEOM_GEOJSON: {
      heading: t('download-projects-with-geometry-headingdownload-projects-geometry-heading'),
      description: t('download-projects-with-geometry-description'),
      fileLabel: 'GEOJSON',
    },
  };

  return (
    <div className="de">
      {/* Community stats key figures */}
      <section className="de-stats-header">
        <div className="de-figures">
          <div className="de-figure de-figure-large">
            <span className="de-figure-value">{isDefined(totalSwipes) ? new Intl.NumberFormat().format(totalSwipes) : '-'}</span>
            <span className="de-figure-label">{t('total-swipes')}</span>
          </div>
          <div className="de-figure">
            <span className="de-figure-value">{isDefined(totalContributors) ? new Intl.NumberFormat().format(totalContributors) : '-'}</span>
            <span className="de-figure-label">{t('contributors')}</span>
          </div>
        </div>
        <div className="de-stats-copy">
          <h2>{t('community-stats-section-heading')}</h2>
          <p>
            {t('community-stats-section-description')}{' '}
            <a href="https://community.mapswipe.org" target="_blank" rel="noreferrer">
              {t('community-dashboard-link-label')}
            </a>
          </p>
        </div>
      </section>

      {/* Explore: filters + map + list */}
      <section className="de-explore">
        <div className="de-explore-head">
          <div>
            <h2>{t('explore-section-heading')}</h2>
            {buildDate && (
              <p className="de-last-fetched">
                {t('data-last-fetched', { date: new Date(Number(buildDate)) })}
                <br />
                {t('explore-section-heading-description')}
              </p>
            )}
          </div>
          {tableProjects.length !== visibleProjects.length && (
            <button type="button" className="de-btn" onClick={handleSeeMore}>
              {t('see-more-button')}
            </button>
          )}
        </div>

        <div className="de-top">
          {/* One disabled-able fieldset: while the shared dataset JSON is
              loading, every filter control is disabled (native fieldset
              cascade) — they apply against the full dataset once it arrives. */}
          <fieldset className="de-filters" disabled={loading} aria-busy={loading}>
            {/* Project status (multi-select as toggle chips) */}
            <fieldset className="de-fieldset">
              <legend>{t('project-status')}</legend>
              <div className="de-chips">
                {(['PUBLISHED', 'FINISHED'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`de-chip${projectStatuses.includes(key) ? ' de-chip-on' : ''}`}
                    onClick={() => setProjectStatuses((l) => toggleInList(l, key))}
                  >
                    <span className={`de-dot de-dot-${key === 'PUBLISHED' ? 'active' : 'finished'}`} />
                    {statusLabels[key]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Project type (multi-select as toggle chips) */}
            <fieldset className="de-fieldset">
              <legend>{t('project-type')}</legend>
              <div className="de-chips">
                {PROJECT_TYPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`de-chip${projectTypes.includes(key) ? ' de-chip-on' : ''}`}
                    onClick={() => setProjectTypes((l) => toggleInList(l, key))}
                  >
                    <ProjectTypeIcon type={key} size="small" />
                    {typeLabels[key]}
                  </button>
                ))}
              </div>
            </fieldset>

            <input
              className="de-input"
              placeholder={t('search-label')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <input
              className="de-input"
              placeholder={t('location-search-label')}
              value={locationSearchText}
              onChange={(e) => setLocationSearchText(e.target.value)}
            />
            <select
              className="de-input"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            >
              <option value="">{t('organization-placeholder')}</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <div className="de-row">
              <label className="de-date">
                <span>{t('date-from-label')}</span>
                <input type="date" className="de-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </label>
              <label className="de-date">
                <span>{t('date-to-label')}</span>
                <input type="date" className="de-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </label>
            </div>
            {filtersApplied && (
              <button type="button" className="de-btn de-clear" onClick={handleClearFilters}>
                {t('clear-filters')}
              </button>
            )}
          </fieldset>

          <div className="de-map-container">
            {/* Map is client-only: rendered after mount so SSR never touches
                leaflet. Placeholder keeps layout stable pre-hydration. Also
                waits for the fetched dataset so it never draws just the 9-item
                initial slice and then re-jumps to the full set. */}
            <div className="de-map">
              {mounted && !loading ? (
                <Suspense fallback={<div className="de-map-placeholder" aria-hidden="true" />}>
                  <ProjectsMapIsland
                    projects={visibleProjects}
                    radiusSelector={radiusSelector}
                    typeLabels={typeLabels}
                    statusLabels={statusLabels}
                  />
                </Suspense>
              ) : (
                <div className="de-map-placeholder" aria-hidden="true" />
              )}
            </div>
            <div className="de-map-settings">
              <span className="de-map-settings-label">{t('bubble-type')}</span>
              {([
                { key: 'area', label: t('mapped-area') },
                { key: 'contributors', label: t('contributors') },
              ]).map((opt) => (
                <label key={opt.key} className="de-radio">
                  <input
                    type="radio"
                    name="bubble"
                    checked={bubble === opt.key}
                    onChange={() => setBubble(opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="de-summary" aria-busy={loading}>
          {/* While loading, the true total comes from the build-time count —
              visibleProjects only holds the initial slice. The area sum is
              slice-only until the dataset arrives, so hide it until then. */}
          <div>{t('visible-projects-count', { totalProjects: loading ? totalCount : visibleProjects.length })}</div>
          {!loading && (
            <>
              <span className="de-dot de-dot-active" />
              <div>{t('total-area-card-text', { area: roundedTotalArea })}</div>
            </>
          )}
        </div>

        <div className="de-list">
          {tableProjects.map((project) => (
            <a key={project.id} className="de-card-link" href={`/projects/${project.firebaseId}/`}>
              <article className="de-card">
                {project.image?.file?.url && (
                  <img
                    className="de-card-img"
                    src={imageMap[project.image.file.url] ?? project.image.file.url}
                    alt={project.name}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="de-card-body">
                  <h3 className="de-card-heading">{project.name}</h3>
                  <div className="de-card-tags">
                    {project.projectType && (
                      <span className="de-tag">
                        <ProjectTypeIcon type={project.projectType as typeof PROJECT_TYPES[number]} size="small" />
                        {typeLabels[project.projectType] ?? project.projectType}
                      </span>
                    )}
                    {project.status && (
                      <span className="de-tag">
                        <span className={`de-dot de-dot-${project.status === 'PUBLISHED' ? 'active' : 'finished'}`} />
                        {statusLabels[project.status] ?? project.status}
                      </span>
                    )}
                  </div>
                  <div className="de-card-meta">
                    {project.region && <span className="de-tag de-tag-plain" title={t('Location')}>{project.region}</span>}
                    {project.requestingOrganization && (
                      <span className="de-tag de-tag-plain" title={t('requesting-organization')}>
                        {project.requestingOrganization.name}
                      </span>
                    )}
                    {project.createdAt && (
                      <span className="de-tag de-tag-plain" title={t('created-at')}>
                        {t('project-card-last-update', { date: project.createdAt })}
                      </span>
                    )}
                    <span className="de-tag de-tag-plain" title={t('project-contributors')}>
                      {t('project-card-contributors-text', { contributors: project.numberOfContributorUsers ?? 0 })}
                    </span>
                  </div>
                  <div className="de-progress">
                    <div className="de-progress-track">
                      <div className="de-progress-bar" style={{ width: `${project.progress * 100}%` }} />
                    </div>
                    <div className="de-progress-label">
                      {t('project-card-progress-text', { progress: project.progress * 100 })}
                    </div>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      </section>

      {/* Download section (global export assets) */}
      <section className="de-download">
        <h2>{t('download-section-heading')}</h2>
        <div className="de-download-list">
          {globalExportAssets.map((asset) => {
            const config = assetConfig[asset.type];
            if (!config) return null;
            const { size, unit } = getFileSizeProperties(asset.fileSize);
            const sizeStr = new Intl.NumberFormat(undefined, {
              style: 'unit', unit, maximumFractionDigits: 1,
            }).format(size);
            return (
              <div className="de-card de-download-card" key={asset.type}>
                <h3>{config.heading}</h3>
                <p>{config.description}</p>
                <div className="de-file-details">
                  <span className="de-tag">{config.fileLabel}</span>
                  <span>{sizeStr}</span>
                </div>
                <a className="de-link" href={asset.file.url} download>
                  {t('download')}
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
