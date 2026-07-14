import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Suspense,
  lazy,
} from 'react';

import ProjectTypeIcon from './ProjectTypeIcon';
import type { MiniProject, Organization, ExportAsset } from 'lib/dataExplorer';

// CSS Modules recovered from the Next app. The island shares the data page's
// module (same hashed classes as the .astro page that mounts it) plus the
// component modules its markup reproduces (Section, Card, Tag, Heading, Link,
// Button, MultiSelectInput, RadioInput, RawInput, SelectInput, ImageWrapper).
import styles from 'pages/[locale]/data/styles.module.css';
import sectionStyles from './Section.module.css';
import cardStyles from './Card.module.css';
import tagStyles from './Tag.module.css';
import headingStyles from './Heading.module.css';
import linkStyles from './Link.module.css';
import buttonStyles from './Button.module.css';
import multiSelectStyles from './MultiSelectInput.module.css';
import radioStyles from './RadioInput.module.css';
import rawInputStyles from './RawInput.module.css';
import selectInputStyles from './SelectInput.module.css';
import imageStyles from './ImageWrapper.module.css';

// Tiny className joiner (parity with @togglecorp/fujs _cs).
function cs(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

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
  const statusClass: Record<string, string> = {
    PUBLISHED: styles.active,
    FINISHED: styles.finished,
  };

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
    <>
      {/* Explore: filters + map + list (Next: exploreSection Section) */}
      <section className={cs(sectionStyles.section, styles.exploreSection)}>
        <div className={sectionStyles.container}>
          <div className={cs(sectionStyles.headingContainer, styles.exploreHeadingContainer)}>
            <h4 className={cs(headingStyles.heading, headingStyles.medium, sectionStyles.heading)}>
              {t('explore-section-heading')}
            </h4>
            {buildDate && (
              <div className={cs(sectionStyles.description, styles.lastFetchedDate)}>
                {t('data-last-fetched', { date: new Date(Number(buildDate)) })}
                <br />
                {t('explore-section-heading-description')}
              </div>
            )}
          </div>

          <div className={styles.content}>
            <div className={styles.topContainer}>
              {/* One disabled-able fieldset: while the shared dataset JSON is
                  loading, every filter control is disabled (native fieldset
                  cascade) — they apply against the full dataset once it
                  arrives. (Next used a plain div; see the fieldset adaptation
                  note in styles.module.css.) */}
              <fieldset className={styles.filters} disabled={loading} aria-busy={loading}>
                {/* Project status (MultiSelectInput as toggle chips) */}
                <div className={multiSelectStyles.input}>
                  <div>{t('project-status')}</div>
                  <div className={multiSelectStyles.optionsContainer}>
                    {(['PUBLISHED', 'FINISHED'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={cs(
                          buttonStyles.button,
                          multiSelectStyles.option,
                          projectStatuses.includes(key) && multiSelectStyles.selected,
                        )}
                        onClick={() => setProjectStatuses((l) => toggleInList(l, key))}
                      >
                        <span className={statusClass[key]}>●</span>
                        {statusLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project type (MultiSelectInput as toggle chips) */}
                <div className={multiSelectStyles.input}>
                  <div>{t('project-type')}</div>
                  <div className={multiSelectStyles.optionsContainer}>
                    {PROJECT_TYPES.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={cs(
                          buttonStyles.button,
                          multiSelectStyles.option,
                          projectTypes.includes(key) && multiSelectStyles.selected,
                        )}
                        onClick={() => setProjectTypes((l) => toggleInList(l, key))}
                      >
                        <ProjectTypeIcon type={key} size="small" />
                        {typeLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  className={cs(rawInputStyles.rawInput, styles.filter)}
                  placeholder={t('search-label')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <input
                  className={cs(rawInputStyles.rawInput, styles.filter)}
                  placeholder={t('location-search-label')}
                  value={locationSearchText}
                  onChange={(e) => setLocationSearchText(e.target.value)}
                />
                <select
                  className={cs(selectInputStyles.selectInput, styles.filter)}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  <option value="">{t('organization-placeholder')}</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                <div className={styles.row}>
                  <label className={styles.inputContainer}>
                    <div>{t('date-from-label')}</div>
                    <input
                      type="date"
                      className={cs(rawInputStyles.rawInput, styles.filter, styles.dateFilter)}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </label>
                  <label className={styles.inputContainer}>
                    <div>{t('date-to-label')}</div>
                    <input
                      type="date"
                      className={cs(rawInputStyles.rawInput, styles.filter, styles.dateFilter)}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </label>
                </div>
                {filtersApplied && (
                  <button
                    type="button"
                    className={cs(buttonStyles.button, buttonStyles.border, styles.clearButton)}
                    onClick={handleClearFilters}
                  >
                    {t('clear-filters')}
                  </button>
                )}
              </fieldset>

              <div className={styles.mapContainer}>
                {/* Map is client-only: rendered after mount so SSR never touches
                    leaflet. Placeholder keeps layout stable pre-hydration. Also
                    waits for the fetched dataset so it never draws just the
                    9-item initial slice and then re-jumps to the full set. */}
                {mounted && !loading ? (
                  <Suspense fallback={<div className={styles.projectsMap} aria-hidden="true" />}>
                    <ProjectsMapIsland
                      className={styles.projectsMap}
                      projects={visibleProjects}
                      radiusSelector={radiusSelector}
                      typeLabels={typeLabels}
                      statusLabels={statusLabels}
                    />
                  </Suspense>
                ) : (
                  <div className={styles.projectsMap} aria-hidden="true" />
                )}
                <div className={styles.mapSettings}>
                  {/* Bubble type (RadioInput with small pill options) */}
                  <div className={cs(radioStyles.input, styles.bubbleFilter)}>
                    <div>{t('bubble-type')}</div>
                    <div className={radioStyles.optionsContainer}>
                      {([
                        { key: 'area', label: t('mapped-area') },
                        { key: 'contributors', label: t('contributors') },
                      ]).map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          className={cs(
                            buttonStyles.button,
                            radioStyles.option,
                            radioStyles.small,
                            bubble === opt.key && radioStyles.selected,
                          )}
                          onClick={() => setBubble(opt.key)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.stats} aria-busy={loading}>
              {/* While loading, the true total comes from the build-time count —
                  visibleProjects only holds the initial slice. The area sum is
                  slice-only until the dataset arrives, so hide it until then. */}
              <div>{t('visible-projects-count', { totalProjects: loading ? totalCount : visibleProjects.length })}</div>
              {!loading && (
                <>
                  <span className={cs(styles.circle, styles.active)}>●</span>
                  <div>{t('total-area-card-text', { area: roundedTotalArea })}</div>
                </>
              )}
            </div>

            <div className={styles.projectList}>
              {tableProjects.map((project) => (
                <a
                  key={project.id}
                  className={cs(linkStyles.link, styles.cardLink)}
                  href={`/projects/${project.firebaseId}/`}
                >
                  {/* `de-card` is a stable, hash-free hook kept for the e2e
                      tests (tests/e2e/islands.spec.ts selects article.de-card). */}
                  <article className={cs('de-card', cardStyles.card, styles.project)}>
                    {project.image?.file?.url && (
                      <div className={cs(imageStyles.imageWrapper, cardStyles.coverImageWrapper, styles.projectImage)}>
                        <img
                          className={cs(imageStyles.image, cardStyles.image)}
                          src={imageMap[project.image.file.url] ?? project.image.file.url}
                          alt={project.name}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <div className={cardStyles.cardContent}>
                      <div className={cardStyles.headerWrapper}>
                        <div className={cardStyles.header}>
                          <h6 className={cs(headingStyles.heading, headingStyles.extraSmall, headingStyles.normal, cardStyles.heading)}>
                            {project.name}
                          </h6>
                        </div>
                        <div className={styles.projectDetailsRow}>
                          {project.projectType && (
                            <div className={cs(tagStyles.tag, tagStyles.small)}>
                              <ProjectTypeIcon type={project.projectType as typeof PROJECT_TYPES[number]} size="small" />
                              {typeLabels[project.projectType] ?? project.projectType}
                            </div>
                          )}
                          {project.status && (
                            <div className={cs(tagStyles.tag, tagStyles.small)}>
                              <span className={statusClass[project.status]}>●</span>
                              {statusLabels[project.status] ?? project.status}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={cs(cardStyles.childrenContainer, styles.projectStats)}>
                        <div className={styles.bottomTags}>
                          {project.region && (
                            <div className={cs(tagStyles.tag, tagStyles.transparent, tagStyles.medium, styles.tag)} title={t('Location')}>
                              {project.region}
                            </div>
                          )}
                          {project.requestingOrganization && (
                            <div className={cs(tagStyles.tag, tagStyles.transparent, tagStyles.medium, styles.tag)} title={t('requesting-organization')}>
                              {project.requestingOrganization.name}
                            </div>
                          )}
                          <div className={styles.projectDetailsRow}>
                            {project.createdAt && (
                              <div className={cs(tagStyles.tag, tagStyles.transparent, tagStyles.medium, styles.tag)} title={t('created-at')}>
                                {t('project-card-last-update', { date: project.createdAt })}
                              </div>
                            )}
                            <div className={cs(tagStyles.tag, tagStyles.transparent, tagStyles.medium, styles.tag)} title={t('project-contributors')}>
                              {t('project-card-contributors-text', { contributors: project.numberOfContributorUsers ?? 0 })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={cardStyles.footer}>
                        <div className={cardStyles.footerContent}>
                          <div className={styles.progressBar}>
                            <div className={styles.track}>
                              <div className={styles.progress} style={{ width: `${project.progress * 100}%` }} />
                            </div>
                            <div className={styles.progressLabel}>
                              {t('project-card-progress-text', { progress: project.progress * 100 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>

          {/* Next rendered the see-more button as the Section's `actions`. */}
          {tableProjects.length !== visibleProjects.length && (
            <div className={sectionStyles.actions}>
              <button
                type="button"
                className={cs(buttonStyles.button, buttonStyles.border)}
                onClick={handleSeeMore}
              >
                {t('see-more-button')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Download section (global export assets) */}
      <section className={cs(sectionStyles.section, sectionStyles.withAlternativeBackground, styles.downloadSection)}>
        <div className={sectionStyles.container}>
          <div className={sectionStyles.headingContainer}>
            <h4 className={cs(headingStyles.heading, headingStyles.medium, sectionStyles.heading)}>
              {t('download-section-heading')}
            </h4>
          </div>
          <div className={styles.urlList}>
            {globalExportAssets.map((asset) => {
              const config = assetConfig[asset.type];
              if (!config) return null;
              const { size, unit } = getFileSizeProperties(asset.fileSize);
              const sizeStr = new Intl.NumberFormat(undefined, {
                style: 'unit', unit, maximumFractionDigits: 1,
              }).format(size);
              return (
                <div className={cardStyles.card} key={asset.type}>
                  <div className={cardStyles.cardContent}>
                    <div className={cardStyles.headerWrapper}>
                      <div className={cardStyles.header}>
                        <h6 className={cs(headingStyles.heading, headingStyles.extraSmall, cardStyles.heading)}>
                          {config.heading}
                        </h6>
                      </div>
                      <div>{config.description}</div>
                    </div>
                    <div className={cs(cardStyles.childrenContainer, styles.downloadCard)}>
                      <div className={styles.fileDetails}>
                        <div className={cs(tagStyles.tag, tagStyles.medium)}>{config.fileLabel}</div>
                        <div>{sizeStr}</div>
                      </div>
                      <a
                        className={cs(linkStyles.link, linkStyles.buttonTransparent, styles.link)}
                        href={asset.file.url}
                        download
                      >
                        {t('download')}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
