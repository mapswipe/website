import i18next from 'i18next';

// Translations live in locales/<locale>/<ns>.json (the same files/keys the old
// Next app served from public/locales — kept OUT of public/ so they never ship
// in dist). We load them VERBATIM and expose i18next.getFixedT for use in
// .astro frontmatter. Translated strings are then passed to React islands as
// props, so i18next never enters an island bundle.

export const LOCALES = ['en', 'ne', 'hu', 'de', 'cs', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
const NAMESPACES = ['project', 'common', 'data', 'blog', 'blogs', 'home', 'get-involved', 'privacy'] as const;

// Eagerly import every locale/namespace JSON at build time, straight from the
// repo-root locales/ (relative to THIS file: src/i18n -> src -> repo root).
// The JSONs are compiled into the build output — they never enter dist/ as
// files.
// Narrow the glob to the namespaces this app uses; a broader glob would
// eagerly parse unrelated (and occasionally malformed) locale files at build.
const files = import.meta.glob(['../../locales/*/project.json', '../../locales/*/common.json', '../../locales/*/data.json', '../../locales/*/blog.json', '../../locales/*/blogs.json', '../../locales/*/home.json', '../../locales/*/get-involved.json', '../../locales/*/privacy.json'], {
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

// Translation gaps fall back to English silently (returnEmptyString: false),
// so surface them once per build instead of letting them hide.
let gapsReported = false;
function reportTranslationGaps() {
    if (gapsReported) return;
    gapsReported = true;
    const lines: string[] = [];
    for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;
        let empty = 0;
        let total = 0;
        for (const ns of NAMESPACES) {
            for (const v of Object.values(resources[locale]?.[ns] ?? {})) {
                total += 1;
                if (v === '') empty += 1;
            }
        }
        if (empty > 0) lines.push(`${locale}: ${empty}/${total} empty (falls back to en)`);
    }
    if (lines.length) console.warn(`[i18n] translation gaps — ${lines.join(' · ')}`);
}

let ready = false;
async function ensureInit() {
    if (ready) return;
    reportTranslationGaps();
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

