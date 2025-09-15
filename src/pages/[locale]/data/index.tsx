import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { gql, request } from 'graphql-request';
import {
    _cs,
    unique,
    listToMap,
    compareDate,
    sum,
    isDefined,
    bound,
} from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    IoLocationOutline,
    IoClose,
    IoDownloadOutline,
    IoFlag,
    IoPerson,
    IoCalendarClearOutline,
    IoEllipseSharp,
} from 'react-icons/io5';

import OgMeta from 'components/OgMeta';
import Button from 'components/Button';
import Tag from 'components/Tag';
import ProjectTypeIcon from 'components/ProjectTypeIcon';
import Page from 'components/Page';
import getFileSizes from 'utils/requests/fileSizes';
import Card from 'components/Card';
import KeyFigure from 'components/KeyFigure';
import NumberOutput from 'components/NumberOutput';
import Hero from 'components/Hero';
import ImageWrapper from 'components/ImageWrapper';
import Link from 'components/Link';
import Heading from 'components/Heading';
import ListItem from 'components/ListItem';
import RawInput from 'components/RawInput';
import Section from 'components/Section';
import RadioInput from 'components/RadioInput';
import MultiSelectInput from 'components/MultiSelectInput';
import SelectInput from 'components/SelectInput';
import {
    rankedSearchOnList,
    ProjectTypeOption,
    ProjectStatusOption,
    ProjectStatus,
    ProjectType,
    graphqlEndpoint,
    Stats,
    getFileSizeProperties,
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
    fileSizeCheckUrl: string;
    url: string;
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
    const stats = gql`
        query CommunityStats {
            communityStats {
                totalContributors
                totalUserGroups
                totalSwipes
            }
        }
    `;
    const value: Stats = await request(graphqlEndpoint, stats);
    const buildDate = process.env.MAPSWIPE_BUILD_DATE;

    const {
        totalContributors,
        totalSwipes,
    } = value?.communityStats ?? {};

    const miniProjects = projects.features.map((feature) => ({
        project_id: feature.properties.project_id ?? null,
        project_type: feature.properties.project_type,
        name: feature.properties.legacyName
            ? feature.properties.name
            : `${feature.properties.topic} (${feature.properties.taskNumber})`,
        status: feature.properties.status ?? null,
        region: feature.properties.legacyName
            ? null
            : feature.properties.region,
        requestingOrganization: feature.properties.legacyName
            ? null
            : feature.properties.requestingOrganization,
        progress: feature.properties.progress !== null && feature.properties.progress !== undefined
            ? Math.round(feature.properties.progress * 100)
            : 0,
        number_of_users: feature.properties.number_of_users ?? null,
        area_sqkm: feature.properties.area_sqkm ?? null,
        coordinates: feature.geometry?.coordinates ?? null,
        day: feature.properties?.day
            ? new Date(feature.properties.day).getTime()
            : null,
        created: feature.properties?.created
            ? new Date(feature.properties.created).getTime()
            : null,
        image: feature.properties?.image ?? null,
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

    const mapswipeApi = process.env.MAPSWIPE_API_ENDPOINT;
    const urls: Omit<UrlInfo, 'size' | 'ok'>[] = [
        {
            name: 'projects_overview',
            url: `${mapswipeApi}projects/projects.csv`,
            fileSizeCheckUrl: '/api/projects/projects.csv',
            type: 'csv',
        },
        {
            name: 'projects_with_geometry',
            url: `${mapswipeApi}projects/projects_geom.geojson`,
            fileSizeCheckUrl: '/api/projects/projects_geom.geojson',
            type: 'geojson',
        },
        {
            name: 'projects_with_centroid',
            url: `${mapswipeApi}projects/projects_centroid.geojson`,
            fileSizeCheckUrl: '/api/projects/projects_centroid.geojson',
            type: 'geojson',
        },
    ];

    const fileSizes = await getFileSizes();
    const urlResponsePromises = urls.map(async (url) => ({
        ...url,
        size: fileSizes?.[url.fileSizeCheckUrl] ?? 0,
    }));

    const urlResponses = await Promise.all(urlResponsePromises);

    return {
        props: {
            ...translations,
            projects: miniProjects,
            urls: urlResponses,
            minArea,
            buildDate: buildDate ?? null,
            maxArea,
            minContributors,
            maxContributors,
            totalContributors,
            totalSwipes,
        },
    };
};

function organizationKeySelector<K extends { label: string }>(option: K) {
    return option.label;
}

function organizationLabelSelector<K extends { label: string }>(option: K) {
    return option.label;
}

function keySelector<K extends { key: string }>(option: K) {
    return option.key;
}
function labelSelector<K extends { label: string | React.ReactNode }>(option: K) {
    return option.label;
}

function iconSelector<K extends { icon?: React.ReactNode }>(option: K) {
    return option.icon;
}

const PAGE_SIZE = 9;

interface Props extends SSRConfig {
    className?: string;
    minArea: number,
    maxArea: number,
    minContributors: number,
    maxContributors: number,
    buildDate: string | null,
    projects: {
        image: string | null;
        project_id: string;
        project_type: ProjectType,
        name: string;
        status: ProjectStatus;
        progress: number | null;
        number_of_users: number | null;
        coordinates: [number, number] | null;
        area_sqkm: number | null;
        day: number | null;
        created: number | null;
        region: string | null;
        requestingOrganization: string | null;
    }[];
    urls: UrlInfo[];
    totalContributors?: number | null | undefined;
    totalSwipes?: number | null | undefined;
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
        totalContributors,
        buildDate,
        totalSwipes,
    } = props;

    const [items, setItems] = useState(PAGE_SIZE);
    const [searchText, setSearchText] = useState<string | undefined>();
    const [locationSearchText, setLocationSearchText] = useState<string | undefined>();
    const [dateFrom, setDateFrom] = useState<string | undefined>();
    const [dateTo, setDateTo] = useState<string | undefined>();
    const [projectTypes, setProjectTypes] = useState<string[] | undefined>();
    const [organization, setOrganization] = useState<string | undefined>();
    const [projectStatuses, setProjectStatuses] = useState<string[] | undefined>();
    const [bubble, setBubble] = useState<string | undefined>();

    const organizationOptions = useMemo(() => (
        unique(
            projects
                .map((project) => project.requestingOrganization)
                .filter(isDefined),
            (item) => item,
        ).map((org) => ({ label: org }))
    ), [projects]);

    const debouncedSearchText = useDebouncedValue(searchText);
    const debouncedLocationSearchText = useDebouncedValue(locationSearchText);

    const { t } = useTranslation('data');

    const bubbleTypes: BubbleTypeOption[] = useMemo(() => ([
        { key: 'area', label: t('mapped-area') },
        { key: 'contributors', label: t('contributors') },
    ]), [t]);

    const projectStatusOptions: ProjectStatusOption[] = useMemo(() => ([
        {
            key: 'active',
            label: t('active-projects'),
            icon: (<IoEllipseSharp className={styles.active} />),
        },
        {
            key: 'finished',
            label: t('finished-projects'),
            icon: (<IoEllipseSharp className={styles.finished} />),
        },
    ]), [t]);

    const projectStatusOptionMap = useMemo(() => (
        listToMap(
            projectStatusOptions,
            (item) => item.key,
            (item) => item,
        )
    ), [projectStatusOptions]);

    const projectTypeOptions: ProjectTypeOption[] = useMemo(() => ([
        {
            key: '1',
            label: t('build-area'),
            icon: (
                <ProjectTypeIcon type="1" size="small" />
            ),
        },
        {
            key: '2',
            label: t('footprint'),
            icon: (
                <ProjectTypeIcon type="2" size="small" />
            ),
        },
        {
            key: '3',
            label: t('change-detection'),
            icon: (
                <ProjectTypeIcon type="3" size="small" />
            ),
        },
        {
            key: '4',
            label: t('completeness'),
            icon: (
                <ProjectTypeIcon type="4" size="small" />
            ),
        },
        {
            key: '10',
            label: t('validate-image'),
            icon: (
                <ProjectTypeIcon type="10" size="small" />
            ),
        },
        {
            key: '7',
            label: t('street'),
            icon: (
                <ProjectTypeIcon type="7" size="small" />
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

    const handleSeeMore = useCallback(
        () => {
            setItems((item) => bound(0, projects.length, item + PAGE_SIZE));
        },
        [projects.length],
    );

    const visibleProjects = useMemo(
        () => {
            let filteredProjects = projects;

            filteredProjects = projectStatuses
                ? filteredProjects.filter((project) => projectStatuses.includes(project.status))
                : filteredProjects;

            filteredProjects = projectTypes
                ? filteredProjects.filter(
                    (project) => projectTypes.includes(String(project.project_type)),
                )
                : filteredProjects;

            filteredProjects = dateFrom
                ? filteredProjects.filter(
                    (project) => compareDate(project.created, dateFrom) >= 0,
                )
                : filteredProjects;

            filteredProjects = dateTo
                ? filteredProjects.filter(
                    (project) => compareDate(dateTo, project.created) >= 0,
                )
                : filteredProjects;

            filteredProjects = organization
                ? filteredProjects.filter(
                    (project) => project.requestingOrganization === organization,
                )
                : filteredProjects;

            filteredProjects = debouncedLocationSearchText
                ? rankedSearchOnList(
                    filteredProjects,
                    debouncedLocationSearchText,
                    (project) => project.region ?? '',
                )
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
        [
            dateFrom,
            dateTo,
            debouncedLocationSearchText,
            projects,
            organization,
            projectStatuses,
            projectTypes,
            debouncedSearchText,
        ],
    );

    const totalArea = sum(
        visibleProjects.map(
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

    const handleClearFiltersClick = useCallback(() => {
        setProjectStatuses(undefined);
        setOrganization(undefined);
        setSearchText(undefined);
        setDateFrom(undefined);
        setDateTo(undefined);
        setProjectTypes(undefined);
        setLocationSearchText(undefined);
    }, []);

    const filtersApplied = searchText
        || dateFrom
        || locationSearchText
        || dateTo
        || organization
        || projectTypes
        || projectStatuses;

    return (
        <Page contentClassName={_cs(styles.data, className)}>
            <OgMeta
                title={String(t('data-tab-head'))}
            />
            <Hero
                title={t('data-page-heading')}
                description={t('data-page-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/data-banner.svg"
                        alt={t('data-banner-image')}
                    />
                )}
            />
            <Section contentClassName={styles.statsHeader}>
                <div className={styles.leftContent}>
                    <KeyFigure
                        className={_cs(styles.figure, styles.largeFigure)}
                        value={(
                            <NumberOutput
                                value={totalSwipes}
                                normal
                            />
                        )}
                        label={t('total-swipes')}
                        variant="circle"
                    />
                    <KeyFigure
                        className={styles.figure}
                        circleColor="complement"
                        value={(
                            <NumberOutput
                                value={totalContributors}
                                normal
                            />
                        )}
                        label={t('contributors')}
                        variant="circle"
                    />
                </div>
                <div className={styles.rightContent}>
                    <Heading
                        className={styles.heading}
                        size="medium"
                    >
                        {t('community-stats-section-heading')}
                    </Heading>
                    <div className={styles.sectionDescription}>
                        {t('community-stats-section-description')}
                        <Link
                            href="https://community.mapswipe.org"
                            variant="underline"
                        >
                            {t('community-dashboard-link-label')}
                        </Link>
                    </div>
                </div>
            </Section>
            <Section
                title={t('type-section-heading')}
                description={t('type-section-description')}
                withAlternativeBackground
                className={styles.typeSection}
                contentClassName={styles.typeList}
            >
                <Card
                    coverImageUrl="/img/find.svg"
                    heading={t('type-find-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="1"
                        />
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
                    heading={t('type-compare-title')}
                    imageClassName={_cs(styles.missionImage, styles.beforeAfterContainer)}
                    coverImageContent={(
                        <>
                            <ImageWrapper
                                imageClassName={styles.beforeImage}
                                className={styles.beforeAfterImageWrapper}
                                src="/img/before.svg"
                                alt="before-image"
                            />
                            <ImageWrapper
                                imageClassName={styles.afterImage}
                                className={styles.beforeAfterImageWrapper}
                                src="/img/after.svg"
                                alt="after-image"
                            />
                        </>
                    )}
                    icons={(
                        <ProjectTypeIcon
                            type="3"
                        />
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
                    coverImageUrl="/img/validate.svg"
                    heading={t('type-validate-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="2"
                        />
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
                <Card
                    coverImageUrl="/img/completeness.png"
                    heading={t('type-completeness-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="4"
                        />
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-completeness-key-point-1')}
                    />
                    <ListItem
                        label={t('type-completeness-key-point-2')}
                    />
                    <ListItem
                        label={t('type-completeness-key-point-3')}
                    />
                </Card>
                <Card
                    coverImageUrl="/img/validate_image.png"
                    heading={t('type-validate-image-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="10"
                        />
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-validate-image-key-point-1')}
                    />
                    <ListItem
                        label={t('type-validate-image-key-point-2')}
                    />
                    <ListItem
                        label={t('type-validate-image-key-point-3')}
                    />
                </Card>
                <Card
                    coverImageUrl="/img/street_image.png"
                    heading={t('type-street-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="7"
                        />
                    )}
                    childrenContainerClassName={styles.keyPointList}
                >
                    <ListItem
                        label={t('type-street-key-point-1')}
                    />
                    <ListItem
                        label={t('type-street-key-point-2')}
                    />
                    <ListItem
                        label={t('type-street-key-point-3')}
                    />
                </Card>
            </Section>
            <Section
                title={t('explore-section-heading')}
                className={styles.exploreSection}
                headingContainerClassName={styles.exploreHeadingContainer}
                contentClassName={styles.content}
                descriptionClassName={styles.lastFetchedDate}
                description={buildDate && (
                    t('data-last-fetched', {
                        date: (new Date(0).setUTCSeconds(Number(buildDate))),
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                    })
                )}
                actions={tableProjects.length !== visibleProjects.length && (
                    <Button
                        variant="border"
                        onClick={handleSeeMore}
                    >
                        {t('see-more-button')}
                    </Button>
                )}
            >
                <div className={styles.topContainer}>
                    <div className={styles.filters}>
                        <MultiSelectInput
                            label={t('project-status') ?? undefined}
                            value={projectStatuses}
                            options={projectStatusOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            iconSelector={iconSelector}
                            onChange={setProjectStatuses}
                        />
                        <MultiSelectInput
                            label={t('project-type') ?? undefined}
                            value={projectTypes}
                            options={projectTypeOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            iconSelector={iconSelector}
                            onChange={setProjectTypes}
                        />
                        <RawInput
                            className={styles.filter}
                            placeholder={t('search-label') ?? undefined}
                            name={undefined}
                            value={searchText}
                            onChange={setSearchText}
                        />
                        <RawInput
                            className={styles.filter}
                            placeholder={t('location-search-label') ?? undefined}
                            name={undefined}
                            value={locationSearchText}
                            onChange={setLocationSearchText}
                        />
                        <SelectInput
                            name="org"
                            className={styles.filter}
                            placeholder={t('organization-placeholder') ?? undefined}
                            value={organization}
                            options={organizationOptions}
                            keySelector={organizationKeySelector}
                            labelSelector={organizationLabelSelector}
                            onChange={setOrganization}
                        />
                        <div className={styles.row}>
                            <div className={styles.inputContainer}>
                                <div>
                                    {t('date-from-label')}
                                </div>
                                <RawInput
                                    className={_cs(styles.filter, styles.dateFilter)}
                                    placeholder={t('search-label') ?? undefined}
                                    name={undefined}
                                    value={dateFrom}
                                    onChange={setDateFrom}
                                    type="date"
                                />
                            </div>
                            <div className={styles.inputContainer}>
                                <div>
                                    {t('date-to-label')}
                                </div>
                                <RawInput
                                    className={_cs(styles.filter, styles.dateFilter)}
                                    placeholder={t('search-label') ?? undefined}
                                    name={undefined}
                                    value={dateTo}
                                    onChange={setDateTo}
                                    type="date"
                                />
                            </div>
                        </div>
                        {filtersApplied && (
                            <Button
                                className={styles.clearButton}
                                onClick={handleClearFiltersClick}
                                variant="border"
                            >
                                <IoClose />
                                {t('clear-filters')}
                            </Button>
                        )}
                    </div>
                    <div className={styles.mapContainer}>
                        <DynamicProjectsMap
                            className={styles.projectsMap}
                            projects={visibleProjects}
                            radiusSelector={radiusSelector}
                        />
                        <div className={styles.mapSettings}>
                            <RadioInput
                                className={styles.bubbleFilter}
                                label={t('bubble-type') ?? undefined}
                                value={bubble}
                                options={bubbleTypes}
                                keySelector={keySelector}
                                labelSelector={labelSelector}
                                onChange={setBubble}
                                optionSize="small"
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div>
                        {t('visible-projects-count', {
                            totalProjects: visibleProjects.length,
                        })}
                    </div>
                    <IoEllipseSharp className={styles.circle} />
                    <div>
                        {t('total-area-card-text', { area: roundedTotalArea })}
                    </div>
                </div>
                <div className={styles.projectList}>
                    {tableProjects.map((project) => (
                        <Link
                            className={styles.cardLink}
                            key={project.project_id}
                            href={`/[locale]/projects/${project.project_id}`}
                        >
                            <Card
                                className={styles.project}
                                coverImageUrl={project.image ?? undefined}
                                imageClassName={styles.projectImage}
                                headingFont="normal"
                                heading={project.name}
                                description={(
                                    <div className={styles.projectDetailsRow}>
                                        {project.project_type && (
                                            <Tag
                                                spacing="small"
                                                icon={(
                                                    projectTypeOptionsMap[project.project_type].icon
                                                )}
                                            >
                                                {projectTypeOptionsMap[project.project_type].label}
                                            </Tag>
                                        )}
                                        {project.status && (
                                            <Tag
                                                spacing="small"
                                                icon={projectStatusOptionMap[project.status].icon}
                                            >
                                                {projectStatusOptionMap[project.status].label}
                                            </Tag>
                                        )}
                                    </div>
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
                                nonOptimizedImage
                            >
                                <div className={styles.projectStats}>
                                    <div className={styles.bottomTags}>
                                        {project.region && (
                                            <Tag
                                                tooltip={t('Location')}
                                                className={styles.tag}
                                                icon={<IoLocationOutline />}
                                                variant="transparent"
                                            >
                                                {project.region}
                                            </Tag>
                                        )}
                                        {project.requestingOrganization && (
                                            <Tag
                                                tooltip={t('requesting-organization')}
                                                className={styles.tag}
                                                icon={<IoFlag />}
                                                variant="transparent"
                                            >
                                                {project.requestingOrganization}
                                            </Tag>
                                        )}
                                        <div className={styles.projectDetailsRow}>
                                            {project.created && (
                                                <Tag
                                                    tooltip={t('created-at')}
                                                    className={styles.tag}
                                                    icon={<IoCalendarClearOutline />}
                                                    variant="transparent"
                                                >
                                                    {t('project-card-last-update', {
                                                        date: project.created,
                                                        dateStyle: 'medium',
                                                    })}
                                                </Tag>
                                            )}
                                            {project.number_of_users && (
                                                <Tag
                                                    tooltip={t('project-contributors')}
                                                    className={styles.tag}
                                                    icon={<IoPerson />}
                                                    variant="transparent"
                                                >
                                                    {t('project-card-contributors-text', { contributors: project.number_of_users })}
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Section>
            <Section
                title={t('download-section-heading')}
                className={styles.downloadSection}
                withAlternativeBackground
                contentClassName={styles.urlList}
            >
                {urls.map((url) => (
                    <Card
                        key={url.name}
                        childrenContainerClassName={styles.downloadCard}
                        heading={downloadHeadingMap[url.name]}
                        description={downloadDescriptionMap[url.name]}
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
                description={t('license-section-description')}
            />
            <Section
                title={t('contact-section-heading')}
                description={t('contact-section-description')}
                withAlternativeBackground
                actions={(
                    <Link
                        href="mailto:info@mapswipe.org"
                        variant="button"
                        target="_blank"
                    >
                        {t('contact-link-label')}
                    </Link>
                )}
            />
        </Page>
    );
}

export default Data;
