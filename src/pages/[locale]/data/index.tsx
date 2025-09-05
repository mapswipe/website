import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { request } from 'graphql-request';
import {
    _cs,
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
import useDebouncedValue from 'hooks/useDebouncedValue';
import { ProjectProperties, ProjectsData, projectsData } from 'pages/queries';
import { graphqlRequest } from 'utils/requests/graphqlRequest';

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

interface Organization {
    id: string;
    name: string;
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

    const buildDate = process.env.MAPSWIPE_BUILD_DATE;

    const value: ProjectsData = await graphqlRequest<ProjectsData>(
        graphqlEndpoint,
        projectsData,
        { includeAll: true },
    );

    const {
        communityStats,
        projects,
        organizations,
    } = value ?? {};

    const {
        totalContributors,
        totalSwipes,
    } = communityStats ?? {};

    const miniProjects = projects?.results.map((feature) => ({
        id: feature.id ?? null,
        projectType: feature.projectType,
        name: feature.name,
        status: feature.status ?? null,
        region: feature.region ?? null,
        requestingOrganizationId: feature.requestingOrganization?.id ?? null,
        requestingOrganization: feature.requestingOrganization ?? null,  
        progress: feature.progress !== null && feature.progress !== undefined
            ? Math.round(Number(feature?.progress) * 100)
            : 0,
        numberOfContributorUsers: feature?.numberOfContributorUsers,
        totalArea: feature?.totalArea ?? null,
        createdAt: feature?.createdAt
            ? new Date(feature.createdAt).getTime()
            : null,
        image: feature?.image ?? null,
        aoiGeometry: feature?.aoiGeometry
            ? {
                id: feature.aoiGeometry.id,
                centroid: feature.aoiGeometry.centroid,
                totalArea: feature.aoiGeometry.totalArea ?? 0,
            }
            : null,
        modifiedAt: feature?.modifiedAt
            ? new Date(feature.modifiedAt).getTime()
            : null,
    })).sort((foo, bar) => ((bar?.modifiedAt ?? 0) - (foo?.modifiedAt ?? 0)));;

    const contributors = miniProjects
        .map((proj) => proj.numberOfContributorUsers)
        .filter(isDefined);
    const minContributors = Math.min(...contributors);
    const maxContributors = Math.max(...contributors);

    const areas = miniProjects
        .map((proj) => proj.totalArea)
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
            totalCount: value.projects.totalCount,
            organizations: organizations?.results ?? [],
        },
    };
};

function organizationKeySelector(option: Organization) {
    return option.id;
}

function organizationLabelSelector(option: Organization) {
    return option.name;
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
    projects: ProjectProperties[];
    urls: UrlInfo[];
    totalContributors?: number | null | undefined;
    totalSwipes?: number | null | undefined;
    totalCount: number;
    organizations: Organization[];
    aoiGeometry: {
        id: string;
        centroid: [number, number] | null;
        totalArea: number | null;
    };
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
        organizations,
    } = props;

    const [items, setItems] = useState(PAGE_SIZE);
    const [searchText, setSearchText] = useState<string | undefined>();
    const [locationSearchText, setLocationSearchText] = useState<string | undefined>();
    const [dateFrom, setDateFrom] = useState<string | undefined>();
    const [dateTo, setDateTo] = useState<string | undefined>();
    const [projectTypes, setProjectTypes] = useState<string[] | undefined>();
    const [projectStatuses, setProjectStatuses] = useState<string[] | undefined>();
    const [bubble, setBubble] = useState<string | undefined>();
    const [organization, setOrganization] = useState<string | undefined>();

    const debouncedSearchText = useDebouncedValue(searchText);
    const debouncedLocationSearchText = useDebouncedValue(locationSearchText);

    const organizationOptions = useMemo(() => organizations ?? [], [organizations]);

    const { t } = useTranslation('data');

    const bubbleTypes: BubbleTypeOption[] = useMemo(() => ([
        { key: 'area', label: t('mapped-area') },
        { key: 'contributors', label: t('contributors') },
    ]), [t]);

    const projectStatusOptions: ProjectStatusOption[] = useMemo(() => ([
        {
            key: 'READY_TO_PROCESS',
            label: t('active-projects'),
            icon: (<IoEllipseSharp className={styles.active} />),
        },
        {
            key: 'PUBLISHED',
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
            key: 'FIND',
            label: t('build-area'),
            icon: (
                <ProjectTypeIcon type="FIND" size="small" />
            ),
        },
        {
            key: 'VALIDATE',
            label: t('footprint'),
            icon: (
                <ProjectTypeIcon type="VALIDATE" size="small" />
            ),
        },
        {
            key: 'COMPARE',
            label: t('change-detection'),
            icon: (
                <ProjectTypeIcon type="COMPARE" size="small" />
            ),
        },
        {
            key: 'COMPLETENESS',
            label: t('validate-image'),
            icon: (
                <ProjectTypeIcon type="VALIDATE_IMAGE" size="small" />
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
                    (project) => projectTypes.includes(String(project.projectType)),
                )
                : filteredProjects;

            filteredProjects = dateFrom
                ? filteredProjects.filter(
                    (project) => compareDate(project.createdAt, dateFrom) >= 0,
                )
                : filteredProjects;

            filteredProjects = dateTo
                ? filteredProjects.filter(
                    (project) => compareDate(dateTo, project.createdAt) >= 0,
                )
                : filteredProjects;

            filteredProjects = organization
                ? filteredProjects.filter(
                    (project) => project.requestingOrganizationId === organization,
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

    const totalAreaSum = sum(
        visibleProjects.map(
            (feature) => feature.totalArea ?? 0,
        ).filter(isDefined),
    );
    const roundedTotalArea = Math.round((totalAreaSum / 1000)) * 1000;

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
        (project: { totalArea: number | null, numberOfContributorUsers: number | null }) => {
            if (bubble === 'area') {
                return 4 + 16 * (((project.totalArea ?? minArea - minArea))
                    / (maxArea - minArea));
            }
            if (bubble === 'contributors') {
                return 4 + 16 * (((project.numberOfContributorUsers ?? 0) - minContributors)
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
                            type="FIND"
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
                            type="COMPARE"
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
                            type="VALIDATE"
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
            </Section>
            <Section
                title={t('explore-section-heading')}
                className={styles.exploreSection}
                headingContainerClassName={styles.exploreHeadingContainer}
                contentClassName={styles.content}
                descriptionClassName={styles.lastFetchedDate}
                description={buildDate && (
                    <>
                        {t('data-last-fetched', {
                            date: (new Date(0).setUTCSeconds(Number(buildDate))),
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                        })}
                        <br />
                        {t('explore-section-heading-description')}
                    </>
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
                        {/* // FIXME: Add roundedTotalArea Here */}
                        {t('total-area-card-text', { area: roundedTotalArea })}
                    </div>
                </div>
                <div className={styles.projectList}>
                    {tableProjects.map((project) => (
                        <Link
                            className={styles.cardLink}
                            key={project.id}
                            href={`/[locale]/projects/${project.id}`}
                        >
                            <Card
                                className={styles.project}
                                coverImageUrl={project.image?.file.url}
                                imageClassName={styles.projectImage}
                                headingFont="normal"
                                heading={project.name}
                                description={(
                                    <div className={styles.projectDetailsRow}>
                                        {project.projectType && (
                                            <Tag
                                                spacing="small"
                                                icon={
                                                   projectTypeOptionsMap[project.projectType]?.icon
                                                }
                                            >
                                                {project.projectType}
                                            </Tag>
                                        )}
                                        {project.status && (
                                            <Tag
                                                spacing="small"
                                                icon={projectStatusOptionMap[project.status]?.icon}
                                            >
                                                {project.status}
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
                                                {project.requestingOrganization.name}
                                            </Tag>
                                        )}
                                        <div className={styles.projectDetailsRow}>
                                            {project.createdAt && (
                                                <Tag
                                                    tooltip={t('created-at')}
                                                    className={styles.tag}
                                                    icon={<IoCalendarClearOutline />}
                                                    variant="transparent"
                                                >
                                                    {t('project-card-last-update', {
                                                        date: project.createdAt,
                                                        dateStyle: 'medium',
                                                    })}
                                                </Tag>
                                            )}
                                            {project.numberOfContributorUsers && (
                                                <Tag
                                                    tooltip={t('project-contributors')}
                                                    className={styles.tag}
                                                    icon={<IoPerson />}
                                                    variant="transparent"
                                                >
                                                    {t('project-card-contributors-text', { contributors: project.numberOfContributorUsers })}
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

