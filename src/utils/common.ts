import {
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

export const graphqlEndpoint = process.env.MAPSWIPE_COMMUNITY_API_ENDPOINT as string;

export interface Stats {
    communityStats: {
        totalContributors: number | null | undefined;
        totalSwipes: number | null | undefined;
    } | null | undefined;
}

const matchRegex = /^(?<topic>.+)\s+-\s+(?<region>.+)\((?<taskNumber>\d+)\)\s+(?<requestingOrganization>.+)$/;
interface ParseRes {
    topic: string;
    region: string;
    taskNumber: string;
    requestingOrganization: string;
}
export function parseProjectName(name: string): ParseRes | undefined {
    const match = name.match(matchRegex);
    if (!match) {
        return undefined;
    }
    return match.groups as unknown as ParseRes;
}

export function rankedSearchOnList<T>(
    list: T[],
    searchString: string | undefined,
    labelSelector: (item: T) => string,
) {
    if (isFalsyString(searchString)) {
        return list;
    }

    return list
        .filter((option) => caseInsensitiveSubmatch(labelSelector(option), searchString))
        .sort((a, b) => compareStringSearch(
            labelSelector(a),
            labelSelector(b),
            searchString,
        ));
}

export async function timeIt<R>(_: string, __: string, func: (() => Promise<R>)) {
    // console.log(`START: ${key}: ${header}`);
    // const startTime = new Date().getTime();
    const resp = await func();
    // const endTime = new Date().getTime();
    // console.log(`END: ${key}: Took ${endTime - startTime}ms`);
    return resp;
}

function compareArray<T extends Array<any>>(foo: T, bar: T): boolean {
    if (foo.length !== bar.length) {
        return false;
    }
    for (let i = 0; i < foo.length; i += 1) {
        if (foo[i] !== bar[i]) {
            return false;
        }
    }
    return true;
}

export function memoize<A extends Array<any>, R>(func: (...args: A) => R) {
    let lastArgs: A;
    let lastResponse: R;
    return (...newArgs: A): R => {
        if (lastArgs && compareArray(lastArgs, newArgs)) {
            // console.log('CACHE: hit', lastArgs, newArgs);
            return lastResponse;
        }
        // console.log('CACHE: miss', lastArgs, newArgs);
        lastResponse = func(...newArgs);
        lastArgs = newArgs;
        return lastResponse;
    };
}

export type ProjectStatus = 'private_active' | 'private_inactive' | 'private_finished' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';

export type ProjectType = 1 | 2 | 3 | 4;

export interface ProjectStatusOption {
    key: ProjectStatus;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
}

export interface ProjectTypeOption {
    key: `${ProjectType}`;
    label: string;
    icon?: React.ReactNode;
}

export const projectNameMapping: {
    [key in ProjectTypeOption['key']]: string
} = {
    1: 'Build Area',
    2: 'Footprint',
    3: 'Change Detection',
    4: 'Completeness',
};

const mb = 1024 * 1024;
export function getFileSizeProperties(fileSize: number) {
    if (fileSize > (mb / 10)) {
        return {
            size: fileSize / mb,
            unit: 'megabyte',
        };
    }
    return {
        size: fileSize / 1024,
        unit: 'kilobyte',
    };
}

export const languageTitleMap: Record<string, string> = {
    ab: 'Abkhazian',
    aa: 'Afar',
    af: 'Afrikaans',
    ak: 'Akan',
    sq: 'Albanian',
    am: 'Amharic',
    ar: 'Arabic',
    an: 'Aragonese',
    hy: 'Armenian',
    as: 'Assamese',
    av: 'Avaric',
    ae: 'Avestan',
    ay: 'Aymara',
    az: 'Azerbaijani',
    bm: 'Bambara',
    ba: 'Bashkir',
    eu: 'Basque',
    be: 'Belarusian',
    bn: 'Bengali',
    bi: 'Bislama',
    bs: 'Bosnian',
    br: 'Breton',
    bg: 'Bulgarian',
    my: 'Burmese',
    ca: 'Catalan, Valencian',
    ch: 'Chamorro',
    ce: 'Chechen',
    ny: 'Chichewa, Chewa, Nyanja',
    zh: 'Chinese',
    cu: 'Church Slavonic, Old Slavonic, Old Church Slavonic',
    cv: 'Chuvash',
    kw: 'Cornish',
    co: 'Corsican',
    cr: 'Cree',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    dv: 'Divehi, Dhivehi, Maldivian',
    nl: 'Dutch, Flemish',
    dz: 'Dzongkha',
    en: 'English',
    eo: 'Esperanto',
    et: 'Estonian',
    ee: 'Ewe',
    fo: 'Faroese',
    fj: 'Fijian',
    fi: 'Finnish',
    fr: 'French',
    fy: 'Western Frisian',
    ff: 'Fulah',
    gd: 'Gaelic, Scottish Gaelic',
    gl: 'Galician',
    lg: 'Ganda',
    ka: 'Georgian',
    de: 'German',
    el: 'Greek, Modern (1453–)',
    kl: 'Kalaallisut, Greenlandic',
    gn: 'Guarani',
    gu: 'Gujarati',
    ht: 'Haitian, Haitian Creole',
    ha: 'Hausa',
    he: 'Hebrew',
    hz: 'Herero',
    hi: 'Hindi',
    ho: 'Hiri Motu',
    hu: 'Hungarian',
    is: 'Icelandic',
    io: 'Ido',
    ig: 'Igbo',
    id: 'Indonesian',
    ia: 'Interlingua (International Auxiliary Language Association)',
    ie: 'Interlingue, Occidental',
    iu: 'Inuktitut',
    ik: 'Inupiaq',
    ga: 'Irish',
    it: 'Italian',
    ja: 'Japanese',
    jv: 'Javanese',
    kn: 'Kannada',
    kr: 'Kanuri',
    ks: 'Kashmiri',
    kk: 'Kazakh',
    km: 'Central Khmer',
    ki: 'Kikuyu, Gikuyu',
    rw: 'Kinyarwanda',
    ky: 'Kirghiz, Kyrgyz',
    kv: 'Komi',
    kg: 'Kongo',
    ko: 'Korean',
    kj: 'Kuanyama, Kwanyama',
    ku: 'Kurdish',
    lo: 'Lao',
    la: 'Latin',
    lv: 'Latvian',
    li: 'Limburgan, Limburger, Limburgish',
    ln: 'Lingala',
    lt: 'Lithuanian',
    lu: 'Luba-Katanga',
    lb: 'Luxembourgish, Letzeburgesch',
    mk: 'Macedonian',
    mg: 'Malagasy',
    ms: 'Malay',
    ml: 'Malayalam',
    mt: 'Maltese',
    gv: 'Manx',
    mi: 'Maori',
    mr: 'Marathi',
    mh: 'Marshallese',
    mn: 'Mongolian',
    na: 'Nauru',
    nv: 'Navajo, Navaho',
    nd: 'North Ndebele',
    nr: 'South Ndebele',
    ng: 'Ndonga',
    ne: 'Nepali',
    no: 'Norwegian',
    nb: 'Norwegian Bokmål',
    nn: 'Norwegian Nynorsk',
    ii: 'Sichuan Yi, Nuosu',
    oc: 'Occitan',
    oj: 'Ojibwa',
    or: 'Oriya',
    om: 'Oromo',
    os: 'Ossetian, Ossetic',
    pi: 'Pali',
    ps: 'Pashto, Pushto',
    fa: 'Persian',
    pl: 'Polish',
    pt: 'Portuguese',
    pa: 'Punjabi, Panjabi',
    qu: 'Quechua',
    ro: 'Romanian, Moldavian, Moldovan',
    rm: 'Romansh',
    rn: 'Rundi',
    ru: 'Russian',
    se: 'Northern Sami',
    sm: 'Samoan',
    sg: 'Sango',
    sa: 'Sanskrit',
    sc: 'Sardinian',
    sr: 'Serbian',
    sn: 'Shona',
    sd: 'Sindhi',
    si: 'Sinhala, Sinhalese',
    sk: 'Slovak',
    sl: 'Slovenian',
    so: 'Somali',
    st: 'Southern Sotho',
    es: 'Spanish, Castilian',
    su: 'Sundanese',
    sw: 'Swahili',
    ss: 'Swati',
    sv: 'Swedish',
    tl: 'Tagalog',
    ty: 'Tahitian',
    tg: 'Tajik',
    ta: 'Tamil',
    tt: 'Tatar',
    te: 'Telugu',
    th: 'Thai',
    bo: 'Tibetan',
    ti: 'Tigrinya',
    to: 'Tonga (Tonga Islands)',
    ts: 'Tsonga',
    tn: 'Tswana',
    tr: 'Turkish',
    tk: 'Turkmen',
    tw: 'Twi',
    ug: 'Uighur, Uyghur',
    uk: 'Ukrainian',
    ur: 'Urdu',
    uz: 'Uzbek',
    ve: 'Venda',
    vi: 'Vietnamese',
    vo: 'Volapük',
    wa: 'Walloon',
    cy: 'Welsh',
    wo: 'Wolof',
    xh: 'Xhosa',
    yi: 'Yiddish',
    yo: 'Yoruba',
    za: 'Zhuang, Chuang',
    zu: 'Zulu',
};
