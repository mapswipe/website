import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useTranslation } from 'next-i18next';
import { _cs, bound, listToMap } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    IoDownloadOutline,
    IoEllipseSharp,
    IoFlag,
    IoCalendarClearOutline,
    IoLocationOutline,
    IoStatsChartSharp,
} from 'react-icons/io5';

import OgMeta from 'components/OgMeta';
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
import data from 'data/staticData.json';

import useSizeTracking from 'hooks/useSizeTracking';

import getProjectHistory, { ProjectHistory } from 'utils/requests/projectHistory';
import {
    ProjectStatusOption,
    ProjectTypeOption,
    getFileSizeProperties,
} from 'utils/common';
import {
    getBounds,
    getPathData,
    getScaleFunction,
} from 'utils/chart';
import { UrlInfo } from 'utils/queries';

import { AllProjectsQuery } from 'generated/types';
import i18nextConfig from '@/next-i18next.config';

import styles from './styles.module.css';

type PublicProjects = NonNullable<NonNullable<AllProjectsQuery['publicProjects']>['results']>;
async function getAllProjects() {
    return (data as AllProjectsQuery)?.publicProjects?.results as unknown as PublicProjects;
}

async function getProjectData(id: string) {
    const projects = (
        data as AllProjectsQuery
    )?.publicProjects?.results as unknown as PublicProjects;
    return projects?.find((item) => String(item.id) === id);
}

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

const DynamicProjectMap = dynamic(() => import('components/ProjectMap'), { ssr: false });

type Props = {
    className: string;
    exportAggregatedResults: UrlInfo;
    exportAggregatedResultsWithGeometry: UrlInfo;
    exportGroups: UrlInfo;
    exportHistory: UrlInfo;
    exportAreaOfInterest: UrlInfo;
    exportResults: UrlInfo;
    exportTasks: UrlInfo;
    exportUsers: UrlInfo;
    exportHotTaskingManagerGeometries: UrlInfo;
    exportModerateToHighAgreementYesMaybeGeometries: UrlInfo;
} & PublicProjects[number];

function Project(props: Props) {
    const {
        className,
        image,
        name,
        projectType,
        description,
        status,
        requestingOrganization,
        createdAt,
        progress,
        region,
        exportAggregatedResults,
        exportAggregatedResultsWithGeometry,
        exportGroups,
        exportHistory,
        exportAreaOfInterest,
        exportResults,
        exportTasks,
        exportUsers,
        exportHotTaskingManagerGeometries,
        exportModerateToHighAgreementYesMaybeGeometries,
        totalArea,
        numberOfContributorUsers,
        id: projectId,
    } = props;

    const svgContainerRef = React.useRef<HTMLDivElement>(null);
    const svgBounds = useSizeTracking(svgContainerRef);
    const [projectGeoJSON, setProjectGeoJSON] = useState(null);
    const [projectHistory, setProjectHistory] = useState<ProjectHistory[] | undefined>();

    useEffect(() => {
        async function fetchData() {
            try {
                if (exportAreaOfInterest?.file?.url) {
                    const res = await fetch(exportAreaOfInterest.file.url);
                    setProjectGeoJSON(await res.json());
                }

                if (exportHistory?.file?.url) {
                    const history = await getProjectHistory(projectId, exportHistory.file.url);
                    setProjectHistory(history);
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed fetching project data', err);
            }
        }
        fetchData();
    }, [exportAreaOfInterest, exportHistory, projectId]);

    const [
        chartPoints,
        chartPointsForArea,
        xAxisTicks,
        yAxisTicks,
    ] = React.useMemo(() => {
        if (!projectHistory || projectHistory.length === 0) {
            return [[], [], [], []];
        }

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

        const percentageTicks = [0, 20, 40, 60, 80, 100].map((percentage) => ({
            value: percentage,
            y: yScale(percentage),
        }));

        const points = (projectHistory ?? []).map((hist) => ({
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
    }, [projectHistory, svgBounds]);

    const { t } = useTranslation('project');

    const projectStatusOptions: ProjectStatusOption[] = useMemo(() => ([
        {
            key: 'PUBLISHED',
            label: t('active'),
            icon: (<IoEllipseSharp className={styles.active} />),
        },
        {
            key: 'FINISHED',
            label: t('finished'),
            icon: (<IoEllipseSharp className={styles.finished} />),
        },
    ]), [t]);

    const projectTypeOptions: ProjectTypeOption[] = useMemo(() => ([
        {
            key: 'FIND',
            label: t('type-find-title'),
            icon: (
                <ProjectTypeIcon type="FIND" size="small" />
            ),
        },
        {
            key: 'VALIDATE',
            label: t('type-validate-title'),
            icon: (
                <ProjectTypeIcon type="VALIDATE" size="small" />
            ),
        },
        {
            key: 'COMPARE',
            label: t('type-compare-title'),
            icon: (
                <ProjectTypeIcon type="COMPARE" size="small" />
            ),
        },
        {
            key: 'COMPLETENESS',
            label: t('type-completeness-title'),
            icon: (
                <ProjectTypeIcon type="COMPLETENESS" size="small" />
            ),
        },
        {
            key: 'VALIDATE_IMAGE',
            label: t('type-validate-image-title'),
            icon: (
                <ProjectTypeIcon type="VALIDATE_IMAGE" size="small" />
            ),
        },
        {
            key: 'STREET',
            label: t('type-streets-view-title'),
            icon: (
                <ProjectTypeIcon type="STREET" size="small" />
            ),
        },
    ]), [t]);

    const projectTypeOptionsMap = useMemo(() => (
        listToMap(
            projectTypeOptions,
            (item) => item.key,
            (item) => item,
        )
    ), [projectTypeOptions]);

    const projectStatusOptionMap = useMemo(() => (
        listToMap(
            projectStatusOptions,
            (item) => item.key,
            (item) => item,
        )
    ), [projectStatusOptions]);

    const roundedTotalArea = Math.round(totalArea ?? 0);

    return (
        <Page contentClassName={_cs(styles.project, className)}>
            <OgMeta
                title={String(t('project-tab-head', { projectTitle: name }))}
                // NOTE: we are not passing description as the description
                // is a markdown/html
                // description={description}
            />
            <Hero
                className={styles.hero}
                mainContentClassName={styles.mainContent}
                title={name}
                description={(
                    <div className={styles.heroDescription}>
                        <div className={styles.topTags}>
                            {projectType && (
                                <Tag
                                    spacing="medium"
                                    icon={projectTypeOptionsMap[projectType]?.icon}
                                >
                                    {projectTypeOptionsMap[projectType].label}
                                </Tag>
                            )}
                            {status && (
                                <Tag
                                    icon={projectStatusOptionMap[status]?.icon}
                                >
                                    {projectStatusOptionMap[status]?.label}
                                </Tag>
                            )}
                        </div>
                        <div className={styles.bottomTags}>
                            {region && (
                                <Tag
                                    tooltip={t('Location')}
                                    className={styles.heroTag}
                                    icon={<IoLocationOutline />}
                                    variant="transparent"
                                >
                                    {region}
                                </Tag>
                            )}
                            {requestingOrganization && (
                                <Tag
                                    tooltip={t('requesting-organization')}
                                    className={styles.heroTag}
                                    icon={<IoFlag />}
                                    variant="transparent"
                                >
                                    {requestingOrganization.name}
                                </Tag>
                            )}
                            {createdAt && (
                                <Tag
                                    tooltip={t('created-at')}
                                    className={styles.heroTag}
                                    icon={<IoCalendarClearOutline />}
                                    variant="transparent"
                                >
                                    {new Date(createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </Tag>
                            )}
                        </div>
                    </div>
                )}
                rightContent={image && (
                    <ImageWrapper
                        className={styles.illustration}
                        src={image.file?.url ?? ''}
                        alt={name}
                        nonOptimizedImage
                    />
                )}
            />
            <Section className={styles.overviewSection}>
                <div className={styles.overviewContent}>
                    <div className={styles.content}>
                        <Heading size="medium">
                            {t('overview-section-title')}
                        </Heading>
                        <div className={styles.description}>
                            {description}
                            <HtmlOutput
                                className={styles.description}
                                content={description ?? ''}
                            />
                        </div>
                    </div>
                    <div className={styles.stats}>
                        <KeyFigure
                            className={_cs(styles.largeFigure, styles.figure)}
                            value={roundedTotalArea}
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
                            value={numberOfContributorUsers}
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
                actions={exportHistory?.modifiedAt && (
                    t('data-last-fetched', {
                        date: new Date(exportHistory.modifiedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }),
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
                            <div>{t('project-card-progress-text', { progress })}</div>
                        </div>
                        <div className={styles.track}>
                            <div
                                style={{ width: `${progress}%` }}
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
                {exportAggregatedResults && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportAggregatedResults?.id}
                        heading={t('aggregated-results-title')}
                        description={t('aggregated-results-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportAggregatedResults?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(
                                        exportAggregatedResults?.fileSize,
                                    ).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportAggregatedResults?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportAggregatedResults?.file?.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportAggregatedResultsWithGeometry && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportAggregatedResultsWithGeometry?.id}
                        heading={t('aggregated-results-with-geometry-title')}
                        description={t('aggregated-results-with-geometry-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportAggregatedResultsWithGeometry?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(
                                        exportAggregatedResultsWithGeometry?.fileSize,
                                    ).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportAggregatedResultsWithGeometry?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportAggregatedResultsWithGeometry?.file?.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportGroups && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportGroups?.id}
                        heading={t('groups-title')}
                        description={t('groups-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportGroups?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(exportGroups?.fileSize).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportGroups?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportGroups?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportHistory && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportHistory?.id}
                        heading={t('history-title')}
                        description={t('history-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportHistory?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(exportHistory?.fileSize).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportHistory?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportHistory?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportResults && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportResults?.id}
                        heading={t('results-title')}
                        description={t('results-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportResults?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(exportResults?.fileSize).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportResults?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportResults?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportTasks && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportTasks?.id}
                        heading={t('tasks-title')}
                        description={t('tasks-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportTasks?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(exportTasks?.fileSize).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportTasks?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportTasks?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportUsers && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportUsers?.id}
                        heading="Users"
                        description="This dataset contains information on the individual contributions per user. This tells you for instance the most active users of this project. (Note that you need to unzip this .gz file before you can use it.)"
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportUsers?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(exportUsers?.fileSize).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportUsers?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportUsers?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportAreaOfInterest && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportAreaOfInterest?.id}
                        heading={t('area-of-interest-title')}
                        description={t('area-of-interest-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportAreaOfInterest?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(
                                        exportAreaOfInterest?.fileSize,
                                    ).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportAreaOfInterest?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportAreaOfInterest?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportHotTaskingManagerGeometries && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportHotTaskingManagerGeometries?.id}
                        heading={t('hot-tasking-manager-geometries-title')}
                        description={t('hot-tasking-manager-geometries-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportHotTaskingManagerGeometries?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(
                                        exportHotTaskingManagerGeometries?.fileSize,
                                    ).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportHotTaskingManagerGeometries?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportHotTaskingManagerGeometries?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
                {exportModerateToHighAgreementYesMaybeGeometries && (
                    <Card
                        childrenContainerClassName={styles.downloadCard}
                        key={exportModerateToHighAgreementYesMaybeGeometries?.id}
                        heading={t('moderate-to-high-agreement-yes-maybe-geometries-title')}
                        description={t('moderate-to-high-agreement-yes-maybe-geometries-description')}
                    >
                        <div className={styles.fileDetails}>
                            <Tag>
                                {exportModerateToHighAgreementYesMaybeGeometries?.mimetype}
                            </Tag>
                            <div>
                                {t('download-size', {
                                    size: getFileSizeProperties(
                                        exportModerateToHighAgreementYesMaybeGeometries?.fileSize,
                                    ).size,
                                    formatParams: { size: { style: 'unit', unit: getFileSizeProperties(exportModerateToHighAgreementYesMaybeGeometries?.fileSize).unit, maximumFractionDigits: 1 } },
                                })}
                            </div>
                        </div>
                        <Link
                            href={exportModerateToHighAgreementYesMaybeGeometries?.file.url}
                            variant="buttonTransparent"
                            className={styles.link}
                        >
                            <IoDownloadOutline />
                            {t('download')}
                        </Link>
                    </Card>
                )}
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
    const projects = await getAllProjects() ?? [];

    const pathsWithParams = projects.flatMap(
        (project: { id: string }) => i18nextConfig.i18n.locales.map((lng: string) => ({
            params: {
                id: project.id.toString(),
                locale: lng,
            },
        })),
    );

    return {
        paths: pathsWithParams,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const locale = context.locale ?? 'en';
    const projectId = context.params?.id as string;

    const project = await getProjectData(projectId);

    const translations = await serverSideTranslations(locale, ['project', 'common']);

    return {
        props: {
            ...translations,
            ...project,
        },
    };
};

export default Project;
