import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { _cs, bound } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { remark } from 'remark';
import Head from 'next/head';
import matter from 'gray-matter';
import html from 'remark-html';
import {
    IoDownloadOutline,
    IoEllipseSharp,
    IoFlag,
    IoCalendarClearOutline,
    IoLocationOutline,
    IoStatsChartSharp,
} from 'react-icons/io5';

import Page from 'components/Page';
import ProjectTypeIcon from 'components/ProjectTypeIcon';
import ImageWrapper from 'components/ImageWrapper';
import Hero from 'components/Hero';
import Tag from 'components/Tag';
import Card from 'components/Card';
import HtmlOutput from 'components/HtmlOutput';
import Section from 'components/Section';
import Heading from 'components/Heading';
import KeyFigure from 'components/KeyFigure';
import Link from 'components/Link';

import useSizeTracking from 'hooks/useSizeTracking';

import getProjectCentroids from 'utils/requests/projectCentroids';
import getProjectGeometries from 'utils/requests/projectGeometries';
import getFileSizes from 'utils/requests/fileSizes';
import getProjectHistory, { ProjectHistory } from 'utils/requests/projectHistory';
import {
    ProjectStatus,
    ProjectStatusOption,
    ProjectTypeOption,
    getFileSizeProperties,
} from 'utils/common';
import {
    getBounds,
    getPathData,
    getScaleFunction,
} from 'utils/chart';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 10;
const CHART_OFFSET = 10;

const chartMargin = {
    left: 2 * Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET * 3,
    bottom: 2 * X_AXIS_HEIGHT + CHART_OFFSET,
};

const xAxisFormatter = (date: Date) => date.toLocaleString(
    // TODO: set language
    undefined,
    {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
    },
);

type DownloadType = (
    'aggregated_results'
    | 'aggregated_results_with_geometry'
    | 'hot_tasking_manager_geometries'
    | 'moderate_to_high_agreement_yes_maybe_geometries'
    | 'groups'
    | 'history'
    | 'results'
    | 'tasks'
    | 'users'
    | 'area_of_interest'
);

type DownloadFileType = 'geojson' | 'csv';

interface UrlInfo {
    name: DownloadType;
    type: DownloadFileType;
    url: string;
    fileSizeCheckUrl: string;
    size: number;
}

const DynamicProjectMap = dynamic(() => import('components/ProjectMap'), { ssr: false });

interface Props extends SSRConfig {
    className?: string;
    totalProgress: number | null;
    totalArea: number | null;
    image: string | null;
    totalContributors: number | null;
    type: number | undefined | null;
    name: string;
    description: string;
    status: ProjectStatus;
    projectGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> | null;
    projectHistory: ProjectHistory[];
    urls: UrlInfo[];
    region?: string | null;
    requestingOrganization?: string | null;
    created?: number | null;
    buildDate: string | null;
}

function Project(props: Props) {
    const {
        className,
        totalProgress,
        image,
        totalArea,
        totalContributors,
        name,
        type,
        description,
        status,
        projectGeoJSON,
        urls,
        projectHistory,
        region,
        requestingOrganization,
        created,
        buildDate,
    } = props;

    const svgContainerRef = React.useRef<HTMLDivElement>(null);
    const svgBounds = useSizeTracking(svgContainerRef);

    const [
        chartPoints,
        chartPointsForArea,
        xAxisTicks,
        yAxisTicks,
    ] = React.useMemo(
        () => {
            const timestamps = projectHistory.map((ph) => ph.timestamp);
            const initialTimeBounds = getBounds(timestamps);

            const NUM_BREAKPOINT_X = 5;
            const timeDiff = initialTimeBounds.max - initialTimeBounds.min;
            const tickDuration = Math.ceil(timeDiff / NUM_BREAKPOINT_X);

            const timeBounds = {
                min: initialTimeBounds.min,
                max: initialTimeBounds.min + (tickDuration * NUM_BREAKPOINT_X),
            };

            const xScale = getScaleFunction(
                timeBounds,
                { min: 0, max: svgBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const percentageBound = { min: 0, max: 100 };
            const yScale = getScaleFunction(
                percentageBound,
                { min: 0, max: svgBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );
            const percentageTicks = [0, 20, 40, 60, 80, 100].map(
                (percentage) => ({
                    value: percentage,
                    y: yScale(percentage),
                }),
            );

            const points = projectHistory.map((hist) => ({
                x: xScale(hist.timestamp),
                y: yScale(bound(100 * hist.progress, 0, 100)),
            }));

            const timeTicks = Array.from(Array(NUM_BREAKPOINT_X + 1)).map((_, i) => {
                const timestamp = initialTimeBounds.min + tickDuration * i;
                const date = new Date(timestamp);

                return {
                    date,
                    timestamp,
                    x: xScale(timestamp),
                };
            });

            return [
                points,
                [
                    { x: xScale(timeBounds.min), y: svgBounds.height },
                    ...points,
                    { x: xScale(timeBounds.max), y: svgBounds.height },
                ],
                timeTicks,
                percentageTicks,
            ];
        },
        [projectHistory, svgBounds],
    );

    const { t } = useTranslation('project');
    const dataHeadingMap: Record<DownloadType, string> = {
        aggregated_results: t('aggregated-results-title'),
        aggregated_results_with_geometry: t('aggregated-results-with-geometry-title'),
        hot_tasking_manager_geometries: t('hot-tasking-manager-geometries-title'),
        moderate_to_high_agreement_yes_maybe_geometries: t('moderate-to-high-agreement-yes-maybe-geometries-title'),
        groups: t('groups-title'),
        history: t('history-title'),
        results: t('results-title'),
        tasks: t('tasks-title'),
        users: t('users-title'),
        area_of_interest: t('area-of-interest-title'),
    };
    const dataDescriptionMap: Record<DownloadType, string> = {
        aggregated_results: t('aggregated-results-description'),
        aggregated_results_with_geometry: t('aggregated-results-with-geometry-description'),
        hot_tasking_manager_geometries: t('hot-tasking-manager-geometries-description'),
        moderate_to_high_agreement_yes_maybe_geometries: t('moderate-to-high-agreement-yes-maybe-geometries-description'),
        groups: t('groups-description'),
        history: t('history-description'),
        results: t('results-description'),
        tasks: t('tasks-description'),
        users: t('users-description'),
        area_of_interest: t('area-of-interest-description'),
    };

    const projectStatusOptions: Record<string, ProjectStatusOption> = useMemo(() => ({
        active: {
            key: 'active',
            label: t('active-projects'),
            icon: (<IoEllipseSharp className={styles.active} />),
        },
        finished: {
            key: 'finished',
            label: t('finished-projects'),
            icon: (<IoEllipseSharp className={styles.finished} />),
        },
    }), [t]);

    const projectTypeOptions: Record<string, ProjectTypeOption> = useMemo(() => ({
        1: {
            key: '1',
            label: t('build-area'),
            icon: (
                <ProjectTypeIcon type="1" size="small" />
            ),
        },
        2: {
            key: '2',
            label: t('footprint'),
            icon: (
                <ProjectTypeIcon type="2" size="small" />
            ),
        },
        3: {
            key: '3',
            label: t('change-detection'),
            icon: (
                <ProjectTypeIcon type="3" size="small" />
            ),
        },
    }), [t]);

    return (
        <Page contentClassName={_cs(styles.project, className)}>
            <Head>
                <title>{t('project-tab-head', { projectTitle: name })}</title>
            </Head>
            <Hero
                className={styles.hero}
                mainContentClassName={styles.mainContent}
                title={name}
                description={(
                    <div className={styles.heroDescription}>
                        <div className={styles.topTags}>
                            {type && (
                                <Tag
                                    spacing="medium"
                                    icon={projectTypeOptions[type].icon}
                                >
                                    {projectTypeOptions[type].label}
                                </Tag>
                            )}
                            {status && (
                                <Tag
                                    icon={projectStatusOptions[status].icon}
                                >
                                    {projectStatusOptions[status].label}
                                </Tag>
                            )}
                        </div>
                        <div className={styles.bottomTags}>
                            {region && (
                                <Tag
                                    className={styles.heroTag}
                                    icon={<IoLocationOutline />}
                                    variant="transparent"
                                >
                                    {region}
                                </Tag>
                            )}
                            {requestingOrganization && (
                                <Tag
                                    className={styles.heroTag}
                                    icon={<IoFlag />}
                                    variant="transparent"
                                >
                                    {requestingOrganization}
                                </Tag>
                            )}
                            {created && (
                                <Tag
                                    className={styles.heroTag}
                                    icon={<IoCalendarClearOutline />}
                                    variant="transparent"
                                >
                                    {t('date', { date: created })}
                                </Tag>
                            )}
                        </div>
                    </div>
                )}
                rightContent={image ? (
                    <ImageWrapper
                        className={styles.illustration}
                        src={image}
                        alt={name}
                        nonOptimizedImage
                    />
                ) : (
                    <div />
                )}
            />
            <Section className={styles.overviewSection}>
                <div className={styles.overviewContent}>
                    <div className={styles.content}>
                        <Heading size="medium">
                            {t('overview-section-title')}
                        </Heading>
                        <div className={styles.description}>
                            <HtmlOutput
                                className={styles.description}
                                content={description}
                            />
                        </div>
                    </div>
                    <div className={styles.stats}>
                        <KeyFigure
                            className={_cs(styles.largeFigure, styles.figure)}
                            value={totalArea}
                            variant="circle"
                            label={(
                                <span>
                                    km
                                    <sup>
                                        2
                                    </sup>
                                </span>
                            )}
                        />
                        <KeyFigure
                            className={styles.figure}
                            variant="circle"
                            circleColor="complement"
                            value={totalContributors}
                            label={t('project-contributors-text')}
                        />
                    </div>
                </div>
            </Section>
            <Section
                className={styles.statsSection}
                contentClassName={styles.content}
                actionsClassName={styles.lastFetchedContainer}
                containerClassName={styles.statsContainer}
                actions={buildDate && (
                    t('data-last-fetched', {
                        date: (new Date(0).setUTCSeconds(Number(buildDate))),
                        formatParams: {
                            date: {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                            },
                        },
                    })
                )}
            >
                {projectGeoJSON && (
                    <div className={styles.mapContainer}>
                        <DynamicProjectMap
                            className={styles.projectsMap}
                            geoJSON={projectGeoJSON}
                        />
                    </div>
                )}
                <div className={styles.rightContainer}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressLabel}>
                            <div>{t('project-progress-label')}</div>
                            <div>{t('project-card-progress-text', { progress: totalProgress })}</div>
                        </div>
                        <div className={styles.track}>
                            <div
                                style={{ width: `${totalProgress}%` }}
                                className={styles.progress}
                            />
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        {chartPoints.length > 1 ? (
                            <div
                                ref={svgContainerRef}
                                className={styles.timelineChartContainer}
                            >
                                <svg className={styles.timelineChart}>
                                    <defs>
                                        <linearGradient
                                            id="path-gradient"
                                            x1="0%"
                                            y1="0%"
                                            x2="0%"
                                            y2="100%"
                                        >
                                            <stop
                                                className={styles.stopStart}
                                                offset="0%"
                                            />
                                            <stop
                                                className={styles.stopEnd}
                                                offset="100%"
                                            />
                                        </linearGradient>
                                    </defs>
                                    {yAxisTicks.map((point, i) => (
                                        <React.Fragment key={point.value}>
                                            <text
                                                className={styles.yAxisTickText}
                                                x={Y_AXIS_WIDTH}
                                                y={point.y + i * 2}
                                            >
                                                {point.value}
                                            </text>
                                            <line
                                                className={styles.xAxisGridLine}
                                                x1={chartMargin.left - CHART_OFFSET}
                                                y1={point.y}
                                                x2={svgBounds.width - CHART_OFFSET}
                                                y2={point.y}
                                            />
                                        </React.Fragment>
                                    ))}
                                    {xAxisTicks.map(
                                        (tick) => (
                                            <React.Fragment key={tick.timestamp}>
                                                <text
                                                    className={styles.xAxisTickText}
                                                    x={tick.x}
                                                    y={svgBounds.height - CHART_OFFSET}
                                                >
                                                    {xAxisFormatter(tick.date)}
                                                </text>
                                                <line
                                                    className={_cs(
                                                        styles.yAxisGridLine,
                                                    )}
                                                    x1={tick.x}
                                                    y1={0}
                                                    x2={tick.x}
                                                    y2={svgBounds.height - CHART_OFFSET}
                                                />
                                            </React.Fragment>
                                        ),
                                    )}
                                    <path
                                        fill="url(#path-gradient)"
                                        d={getPathData(chartPointsForArea)}
                                    />
                                    <path
                                        className={styles.path}
                                        d={getPathData(chartPoints)}
                                    />
                                </svg>
                            </div>
                        ) : (
                            <div className={styles.emptyChart}>
                                <IoStatsChartSharp className={styles.chartIcon} />
                                <div className={styles.message}>
                                    Not enough data points for the chart!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
            <Section
                title={t('data-section-heading')}
                description={t('data-section-description')}
                descriptionClassName={styles.downloadDescription}
                className={styles.downloadSection}
                contentClassName={styles.urlList}
                withAlternativeBackground
            >
                {urls.map((url) => (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={url.type}
                        heading={dataHeadingMap[url.name]}
                        description={dataDescriptionMap[url.name]}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {url.type}
                            </Tag>
                            <div>
                                {t('download-size', { size: getFileSizeProperties(url.size).size, formatParams: { size: { style: 'unit', unit: getFileSizeProperties(url.size).unit, maximumFractionDigits: 1 } } })}
                            </div>
                        </div>
                        <Link
                            href={url.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                ))}
            </Section>
            <Section
                title={t('license-section-heading')}
                description={(
                    <div className={styles.licenseDescription}>
                        <p>
                            {t('license-section-description-1')}
                        </p>
                        <p>
                            {t('license-section-description-2')}
                        </p>
                    </div>
                )}
            />
        </Page>
    );
}

export const getI18nPaths = () => (
    i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
        },
    }))
);

export const getStaticPaths: GetStaticPaths = async () => {
    const projects = await getProjectCentroids();

    const pathsWithParams = projects.features.flatMap((feature) => {
        const withLocales = i18nextConfig.i18n.locales.map((lng) => ({
            params: {
                id: feature.properties.project_id,
                locale: lng,
            },
        }));
        return withLocales;
    });

    return {
        paths: pathsWithParams,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const projectId = context?.params?.id;

    const translations = await serverSideTranslations(locale as string, [
        'project',
        'common',
    ]);

    const projects = await getProjectCentroids();
    const project = projects.features.find(
        (feature) => feature.properties.project_id === projectId,
    );
    if (!project) {
        throw new Error(`Could not get project ${projectId}`);
    }

    const geojsons = await getProjectGeometries();
    const geojson = geojsons.features.find(
        (feature) => feature.properties.project_id === projectId,
    )?.geometry;

    const historyJSON = await getProjectHistory(project.properties.project_id);

    const matterResult = matter(project.properties.project_details);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content.replace(/\\n/g, '\n'));
    const contentHtml = processedContent.toString();

    const mapswipeApi = process.env.MAPSWIPE_API_ENDPOINT;
    const urls: Omit<UrlInfo, 'size' | 'ok'>[] = [
        {
            name: 'aggregated_results',
            url: `${mapswipeApi}agg_results/agg_results_${projectId}.csv.gz`,
            fileSizeCheckUrl: `/api/agg_results/agg_results_${projectId}.csv.gz`,
            type: 'csv',
        },
        {
            name: 'aggregated_results_with_geometry',
            url: `${mapswipeApi}agg_results/agg_results_${projectId}_geom.geojson.gz`,
            fileSizeCheckUrl: `/api/agg_results/agg_results_${projectId}_geom.geojson.gz`,
            type: 'geojson',
        },
        {
            name: 'hot_tasking_manager_geometries',
            url: `${mapswipeApi}hot_tm/hot_tm_${projectId}.geojson`,
            fileSizeCheckUrl: `/api/hot_tm/hot_tm_${projectId}.geojson`,
            type: 'geojson',
        },
        {
            name: 'moderate_to_high_agreement_yes_maybe_geometries',
            url: `${mapswipeApi}yes_maybe/yes_maybe_${projectId}.geojson`,
            fileSizeCheckUrl: `/api/yes_maybe/yes_maybe_${projectId}.geojson`,
            type: 'geojson',
        },
        {
            name: 'groups',
            url: `${mapswipeApi}groups/groups_${projectId}.csv.gz`,
            fileSizeCheckUrl: `/api/groups/groups_${projectId}.csv.gz`,
            type: 'csv',
        },
        {
            name: 'history',
            url: `${mapswipeApi}history/history_${projectId}.csv`,
            fileSizeCheckUrl: `/api/history/history_${projectId}.csv`,
            type: 'geojson',
        },
        {
            name: 'results',
            url: `${mapswipeApi}results/results_${projectId}.csv.gz`,
            fileSizeCheckUrl: `/api/results/results_${projectId}.csv.gz`,
            type: 'csv',
        },
        {
            name: 'tasks',
            url: `${mapswipeApi}tasks/tasks_${projectId}.csv.gz`,
            fileSizeCheckUrl: `/api/tasks/tasks_${projectId}.csv.gz`,
            type: 'csv',
        },
        {
            name: 'users',
            url: `${mapswipeApi}users/users_${projectId}.csv.gz`,
            fileSizeCheckUrl: `/api/users/users_${projectId}.csv.gz`,
            type: 'csv',
        },
        {
            name: 'area_of_interest',
            url: `${mapswipeApi}project_geometries/project_geom_${projectId}.geojson`,
            fileSizeCheckUrl: `/api/project_geometries/project_geom_${projectId}.geojson`,
            type: 'geojson',
        },
    ];

    const fileSizes = await getFileSizes();
    const urlResponsePromises = urls.map((url) => ({
        ...url,
        size: fileSizes?.[url.fileSizeCheckUrl] ?? 0,
    }));

    const buildDate = process.env.MAPSWIPE_BUILD_DATE ?? null;
    const urlResponses = await Promise.all(urlResponsePromises);

    return {
        props: {
            ...translations,
            totalProgress: (
                project.properties.progress !== null
                && project.properties.progress !== undefined
            )
                ? Math.round(project.properties.progress * 100)
                : 0,
            totalArea: Math.round(project.properties.area_sqkm ?? 0),
            totalContributors: project.properties.number_of_users ?? null,
            name: project.properties.legacyName
                ? project.properties.name
                : `${project.properties.topic} (${project.properties.taskNumber})`,
            region: project.properties.legacyName
                ? null
                : project.properties.region,
            requestingOrganization: project.properties.legacyName
                ? null
                : project.properties.requestingOrganization,
            day: project.properties?.day
                ? new Date(project.properties.day).getTime()
                : null,
            created: project.properties?.created
                ? new Date(project.properties.created).getTime()
                : null,
            image: project.properties.image ?? null,
            type: project.properties.project_type,
            description: contentHtml,
            status: project.properties.status,
            projectGeoJSON: geojson ?? null,
            projectHistory: historyJSON,
            buildDate,
            urls: urlResponses.filter((url) => url.size > 0),
        },
    };
};

export default Project;
