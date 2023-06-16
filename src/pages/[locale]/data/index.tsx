import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import {
    _cs,
    sum,
    isDefined,
    bound,
} from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { IoDownload } from 'react-icons/io5';

import Button from 'components/Button';
import Card from 'components/Card';
import Hero from 'components/Hero';
import ImageWrapper from 'components/ImageWrapper';
import Link from 'components/Link';
import ListItem from 'components/ListItem';
import RawInput from 'components/RawInput';
import Section from 'components/Section';
import SelectInput from 'components/SelectInput';
import {
    rankedSearchOnList,
    projectNameMapping,
    projectTypes,
    projectStatuses,
    ProjectStatus,
    ProjectType,
} from 'utils/common';
import getProjectCentroids from 'utils/requests/projectCentroids';
import useDebouncedValue from 'hooks/useDebouncedValue';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

type DownloadType = (
    'projects_overview'
    | 'projects_with_geometry'
    | 'projects_with_centroid'
);

type DownloadFileType = 'geojson' | 'csv';

interface UrlInfo {
    name: DownloadType;
    type: DownloadFileType;
    url: string;
    ok: boolean;
    size: number;
}

const DynamicProjectsMap = dynamic(() => import('components/ProjectsMap'), { ssr: false });

export const getI18nPaths = () => (
    i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
        },
    }))
);

export interface BubbleTypeOption {
    key: 'area' | 'contributors';
    label: string;
}

export const bubbleTypes: BubbleTypeOption[] = [
    { key: 'area', label: 'Mapped Area' },
    { key: 'contributors', label: 'Contributors' },
];

export const getStaticPaths = () => ({
    fallback: false,
    paths: getI18nPaths(),
});

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const translations = await serverSideTranslations(locale as string, [
        'data',
        'common',
    ]);

    const projects = await getProjectCentroids();

    const miniProjects = projects.features.map((feature) => ({
        project_id: feature.properties.project_id ?? null,
        project_type: feature.properties.project_type,
        name: feature.properties.name ?? null,
        status: feature.properties.status ?? null,
        progress: feature.properties.progress !== null && feature.properties.progress !== undefined
            ? Math.round(feature.properties.progress * 100)
            : null,
        number_of_users: feature.properties.number_of_users ?? null,
        area_sqkm: feature.properties.area_sqkm ?? null,
        coordinates: feature.geometry?.coordinates ?? null,
        day: feature.properties?.day
            ? new Date(feature.properties.day).getTime()
            : null,
    })).sort((foo, bar) => ((bar.day ?? 0) - (foo.day ?? 0)));

    const contributors = miniProjects
        .map((proj) => proj.number_of_users)
        .filter(isDefined);
    const minContributors = Math.min(...contributors);
    const maxContributors = Math.max(...contributors);

    const areas = miniProjects
        .map((proj) => proj.area_sqkm)
        .filter(isDefined);
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);

    const urls: Omit<UrlInfo, 'size' | 'ok'>[] = [
        {
            name: 'projects_overview',
            url: 'https://apps.mapswipe.org/api/projects/projects.csv',
            type: 'csv',
        },
        {
            name: 'projects_with_geometry',
            url: 'https://apps.mapswipe.org/api/projects/projects_geom.geojson',
            type: 'geojson',
        },
        {
            name: 'projects_with_centroid',
            url: 'https://apps.mapswipe.org/api/projects/projects_centroid.geojson',
            type: 'geojson',
        },
    ];

    const urlResponsePromises = urls.map(async (url) => {
        const res = await fetch(url.url, { method: 'HEAD' });
        return {
            ...url,
            ok: res.ok,
            size: Number(res.headers.get('content-length') ?? '0'),
        };
    });

    const urlResponses = await Promise.all(urlResponsePromises);

    return {
        props: {
            ...translations,
            projects: miniProjects,
            urls: urlResponses,
            minArea,
            maxArea,
            minContributors,
            maxContributors,
        },
    };
};

function keySelector<K extends { key: string }>(option: K) {
    return option.key;
}
function labelSelector<K extends { label: string }>(option: K) {
    return option.label;
}

const PAGE_SIZE = 9;

interface Props extends SSRConfig {
    className?: string;
    minArea: number,
    maxArea: number,
    minContributors: number,
    maxContributors: number,
    projects: {
        project_id: string;
        project_type: ProjectType,
        name: string;
        status: ProjectStatus;
        progress: number | null;
        number_of_users: number | null;
        coordinates: [number, number] | null;
        area_sqkm: number | null;
        day: number | null;
    }[];
    urls: UrlInfo[];
}

function Data(props: Props) {
    const {
        className,
        projects,
        urls,
        minArea,
        maxArea,
        minContributors,
        maxContributors,
    } = props;

    const [items, setItems] = useState(PAGE_SIZE);
    const [searchText, setSearchText] = useState<string | undefined>();
    const [projectType, setProjectType] = useState<string | undefined>();
    const [projectStatus, setProjectStatus] = useState<string | undefined>();
    const [bubble, setBubble] = useState<string | undefined>();

    const debouncedSearchText = useDebouncedValue(searchText);

    const { t } = useTranslation('data');

    const handleSeeMore = useCallback(
        () => {
            setItems((item) => bound(0, projects.length, item + PAGE_SIZE));
        },
        [projects.length],
    );

    const visibleProjects = useMemo(
        () => {
            let filteredProjects = projects;

            filteredProjects = projectStatus
                ? filteredProjects.filter((project) => project.status === projectStatus)
                : filteredProjects;

            filteredProjects = projectType
                ? filteredProjects.filter((project) => String(project.project_type) === projectType)
                : filteredProjects;

            filteredProjects = debouncedSearchText
                ? rankedSearchOnList(
                    filteredProjects,
                    debouncedSearchText,
                    (project) => project.name,
                )
                : filteredProjects;

            return filteredProjects;
        },
        [projects, projectStatus, projectType, debouncedSearchText],
    );

    const completedProjects = visibleProjects.filter(
        (feature) => feature.status === 'finished',
    );
    const totalFinishedProjects = completedProjects.length;
    const totalArea = sum(
        completedProjects.map(
            (feature) => feature.area_sqkm,
        ).filter(isDefined),
    );
    const roundedTotalArea = Math.round((totalArea / 1000)) * 1000;

    const tableProjects = visibleProjects.slice(0, items);
    const downloadHeadingMap: Record<DownloadType, string> = {
        projects_overview: t('download-projects-overview-heading'),
        projects_with_geometry: t('download-projects-with-geometry-heading'),
        projects_with_centroid: t('download-projects-with-centroid-heading'),
    };
    const downloadDescriptionMap: Record<DownloadType, string> = {
        projects_overview: t('download-projects-overview-description'),
        projects_with_geometry: t('download-projects-with-geometry-description'),
        projects_with_centroid: t('download-projects-with-centroid-description'),
    };

    const radiusSelector = useCallback(
        (project: { area_sqkm: number | null, number_of_users: number | null }) => {
            if (bubble === 'area') {
                return 4 + 16 * (((project.area_sqkm ?? minArea - minArea))
                                 / (maxArea - minArea));
            }
            if (bubble === 'contributors') {
                return 4 + 16 * (((project.number_of_users ?? 0) - minContributors)
                                 / (maxContributors - minContributors));
            }
            return 4;
        },
        [bubble, maxArea, minArea, maxContributors, minContributors],
    );

    return (
        <div className={_cs(styles.data, className)}>
            <Hero
                title={t('data-page-heading')}
                description={t('data-page-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                )}
            />
            <Section
                title={t('community-stats-section-heading')}
                description={t('community-stats-section-description')}
                actions={(
                    <Link
                        href="https://community.mapswipe.org"
                        variant="button"
                    >
                        {t('community-dashboard-link-label')}
                    </Link>
                )}
            />
            <Section
                title={t('type-section-heading')}
                description={t('type-section-description')}
                withAlternativeBackground
                className={styles.typeSection}
                contentClassName={styles.typeList}
            >
                <Card
                    coverImageUrl="/img/placeholder.png"
                    heading={t('type-find-title')}
                    footerIcons={(
                        <Button>
                            {t('type-find-action-label')}
                        </Button>
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-find-key-point-1')}
                    />
                    <ListItem
                        label={t('type-find-key-point-2')}
                    />
                    <ListItem
                        label={t('type-find-key-point-3')}
                    />
                </Card>
                <Card
                    coverImageUrl="/img/placeholder.png"
                    heading={t('type-compare-title')}
                    footerIcons={(
                        <Button>
                            {t('type-compare-action-label')}
                        </Button>
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-compare-key-point-1')}
                    />
                    <ListItem
                        label={t('type-compare-key-point-2')}
                    />
                    <ListItem
                        label={t('type-compare-key-point-3')}
                    />
                </Card>
                <Card
                    coverImageUrl="/img/placeholder.png"
                    heading={t('type-validate-title')}
                    footerIcons={(
                        <Button>
                            {t('type-validate-action-label')}
                        </Button>
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-validate-key-point-1')}
                    />
                    <ListItem
                        label={t('type-validate-key-point-2')}
                    />
                    <ListItem
                        label={t('type-validate-key-point-3')}
                    />
                </Card>
            </Section>
            <Section
                title={t('explore-section-heading')}
                className={styles.exploreSection}
                contentClassName={styles.content}
                actions={tableProjects.length !== visibleProjects.length && (
                    <Button
                        variant="border"
                        onClick={handleSeeMore}
                    >
                        {t('see-more-button')}
                    </Button>
                )}
            >
                <div className={styles.filters}>
                    <RawInput
                        className={styles.filter}
                        placeholder={t('search-label') ?? undefined}
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                    />
                    <SelectInput
                        className={styles.filter}
                        placeholder={t('project-status') ?? undefined}
                        name={undefined}
                        value={projectStatus}
                        options={projectStatuses}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setProjectStatus}
                    />
                    <SelectInput
                        className={styles.filter}
                        placeholder={t('project-type') ?? undefined}
                        name={undefined}
                        value={projectType}
                        options={projectTypes}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setProjectType}
                    />
                    <SelectInput
                        className={styles.filter}
                        placeholder={t('bubble-type') ?? undefined}
                        name={undefined}
                        value={bubble}
                        options={bubbleTypes}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setBubble}
                    />
                </div>
                <div className={styles.mapContainer}>
                    <DynamicProjectsMap
                        className={styles.projectsMap}
                        projects={visibleProjects}
                        radiusSelector={radiusSelector}
                    />
                </div>
                <div className={styles.stats}>
                    <div>
                        {t('total-area-card-text', { area: roundedTotalArea })}
                    </div>
                    <div>
                        {t('finished-project-card-text', { projects: totalFinishedProjects })}
                    </div>
                </div>
                <div className={styles.projectList}>
                    {tableProjects.map((project) => (
                        <Card
                            // className={styles.project}
                            key={project.project_id}
                            heading={(
                                <Link
                                    href={`/[locale]/projects/${project.project_id}`}
                                >
                                    {project.name}
                                </Link>
                            )}
                            footerContent={(
                                <div className={styles.progressBar}>
                                    <div className={styles.track}>
                                        <div
                                            style={{ width: `${project.progress}%` }}
                                            className={styles.progress}
                                        />
                                    </div>
                                    <div className={styles.progressLabel}>
                                        {t('project-card-progress-text', { progress: project.progress })}
                                    </div>
                                </div>
                            )}
                        >
                            <div className={styles.projectStats}>
                                <div>
                                    {t('project-card-type', { type: projectNameMapping[project.project_type] })}
                                </div>
                                <div>
                                    {t('project-card-status-text', { status: project.status })}
                                </div>
                                <div>
                                    {t('project-card-last-update', { date: project.day })}
                                </div>
                                <div>
                                    {t('project-card-contributors-text', { contributors: project.number_of_users })}
                                </div>
                                <div>
                                    {t('project-card-area', { area: project.area_sqkm })}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Section>
            <Section
                title={t('download-section-heading')}
                className={styles.downloadSection}
                contentClassName={styles.urlList}
            >
                {urls.map((url) => (
                    <Card
                        key={url.name}
                        heading={downloadHeadingMap[url.name]}
                        description={downloadDescriptionMap[url.name]}
                        footerActions={(
                            <a href={url.url}>
                                <IoDownload className={styles.downloadIcon} />
                            </a>
                        )}
                    >
                        <div>
                            {t('download-type', { type: url.type })}
                        </div>
                        <div>
                            {t('download-size', { size: url.size / (1024 * 1024), formatParams: { size: { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 } } })}
                        </div>
                    </Card>
                ))}
            </Section>
            <Section
                title={t('license-section-heading')}
                description={t('license-section-description')}
                withAlternativeBackground
            />
            <Section
                title={t('contact-section-heading')}
                description={t('contact-section-description')}
                actions={(
                    <Button>
                        {t('contact-link-label')}
                    </Button>
                )}
            />
        </div>
    );
}

export default Data;
