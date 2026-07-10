import i18next from 'i18next';

// The existing Next app's translations live in public/locales/<locale>/<ns>.json.
// We load them VERBATIM (same files, same keys) and expose i18next.getFixedT
// for use in .astro frontmatter. Translated strings are then passed to React
// islands as props, so i18next never enters an island bundle.

export const LOCALES = ['en', 'ne', 'hu', 'de', 'cs', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
const NAMESPACES = ['project', 'common', 'data', 'blog', 'blogs', 'home', 'get-involved', 'privacy'] as const;

// Eagerly import every locale/namespace JSON at build time, straight from the
// repo-root public/locales (relative to THIS file: src/i18n -> src -> astro ->
// repo root). The JSONs are compiled into the build output — they never enter
// dist/ as files (no symlink under astro/public anymore).
// Narrow the glob to the namespaces this app uses; a broader glob would
// eagerly parse unrelated (and occasionally malformed) locale files at build.
const files = import.meta.glob(['../../../public/locales/*/project.json', '../../../public/locales/*/common.json', '../../../public/locales/*/data.json', '../../../public/locales/*/blog.json', '../../../public/locales/*/blogs.json', '../../../public/locales/*/home.json', '../../../public/locales/*/get-involved.json', '../../../public/locales/*/privacy.json'], {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

const resources: Record<string, Record<string, Record<string, string>>> = {};
for (const [path, mod] of Object.entries(files)) {
  const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, ns] = match;
  if (!(LOCALES as readonly string[]).includes(locale)) continue;
  if (!(NAMESPACES as readonly string[]).includes(ns)) continue;
  resources[locale] ??= {};
  resources[locale][ns] = mod;
}

let ready = false;
async function ensureInit() {
  if (ready) return;
  await i18next.init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    ns: NAMESPACES as unknown as string[],
    defaultNS: 'common',
    resources,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
  });
  ready = true;
}

export async function getT(locale: string, ns: string) {
  await ensureInit();
  return i18next.getFixedT(locale, ns);
}

// Resolve EVERY key of a namespace for `locale` into a plain {key: string} dict.
// Used to hand a locale's strings to a React island as a prop, keeping the
// i18next runtime OUT of the island bundle. Values are the raw template strings
// (interpolation placeholders like `{{x, number}}` left intact) so the island
// can do its own tiny interpolation for the few dynamic keys. Empty translated
// strings fall back to the English source (parity with returnEmptyString:false,
// which would otherwise surface the raw key). Missing English -> the key itself.
export async function getDict(locale: string, ns: string): Promise<Record<string, string>> {
  await ensureInit();
  const source = resources[locale]?.[ns] ?? {};
  const fallback = resources[DEFAULT_LOCALE]?.[ns] ?? {};
  const dict: Record<string, string> = {};
  const keys = new Set([...Object.keys(fallback), ...Object.keys(source)]);
  for (const key of keys) {
    const value = source[key];
    dict[key] = value && value.trim() !== '' ? value : (fallback[key] ?? key);
  }
  return dict;
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
