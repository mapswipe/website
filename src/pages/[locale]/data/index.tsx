import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
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
    getFileSizeProperties,
} from 'utils/common';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { GlobalExportAssets } from 'utils/queries';
import data from 'fullData/staticData.json';

import { AllDataQuery } from 'generated/types';
import i18nextConfig from '@/next-i18next.config';

import styles from './styles.module.css';

type PublicProjects = NonNullable<NonNullable<AllDataQuery['publicProjects']>['results']>;
type PublicProject = PublicProjects[number];

async function getAllProjects() {
    // FIXME: This should be inferred
    return (data as AllDataQuery)?.publicProjects?.results as unknown as PublicProjects;
}
async function getAllData() {
    // FIXME: This should be inferred
    return data as AllDataQuery;
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

export const getStaticProps: GetStaticProps = async (context) => {
    const locale = context?.params?.locale;
    const translations = await serverSideTranslations(locale as string, [
        'data',
        'common',
    ]);

    const buildDate = process.env.MAPSWIPE_BUILD_DATE;

    const value = await getAllData();
    const publicProjects = await getAllProjects();

    const {
        communityStats,
        publicOrganizations,
        globalExportAssets,
    } = value || {};

    const {
        totalContributors = null,
        totalSwipes = null,
    } = communityStats || {};

    const miniProjects = publicProjects?.map((feature) => ({
        id: feature.id ?? '',
        projectType: feature.projectType,
        name: feature.name,
        firebaseId: feature.firebaseId,
        status: feature.status ?? null,
        region: feature.region ?? null,
        requestingOrganizationId: feature.requestingOrganization?.id ?? null,
        requestingOrganization: feature.requestingOrganization ?? null,
        progress: feature.progress,
        numberOfContributorUsers: feature?.numberOfContributorUsers,
        createdAt: feature?.createdAt
            ? new Date(feature.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : null,
        image: feature?.image ?? null,
        exportAreaOfInterest: feature?.exportAreaOfInterest ?? null,
        aoiGeometry: feature?.aoiGeometry,
        modifiedAt: feature?.modifiedAt
            ? new Date(feature.modifiedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : null,
    })) ?? [];

    const contributors = miniProjects?.map((proj) => proj.numberOfContributorUsers)
        .filter(isDefined);
    const minContributors = contributors?.length > 0 ? Math.min(...contributors) : 0;
    const maxContributors = contributors?.length > 0 ? Math.max(...contributors) : 0;

    const sortedProjects = [...miniProjects];
    sortedProjects.sort((a, b) => compareDate(a.createdAt, b.createdAt, -1));

    const areas = miniProjects?.map((proj) => proj.aoiGeometry?.totalArea)
        .filter(isDefined);
    const minArea = areas?.length > 0 ? Math.min(...areas) : 0;
    const maxArea = areas?.length > 0 ? Math.max(...areas) : 0;

    return {
        props: {
            ...translations,
            projects: sortedProjects,
            minArea,
            buildDate: buildDate ?? null,
            maxArea,
            minContributors,
            maxContributors,
            totalContributors,
            totalSwipes,
            organizations: publicOrganizations?.results ?? [],
            globalExportAssets: globalExportAssets ?? [],
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

interface Props {
    className?: string;
    minArea: number,
    maxArea: number,
    minContributors: number,
    maxContributors: number,
    buildDate: string | null,
    projects: PublicProjects;
    totalContributors?: number | null | undefined;
    totalSwipes?: number | null | undefined;
    organizations: Organization[];
    globalExportAssets: GlobalExportAssets[];
}

function Data(props: Props) {
    const {
        className,
        projects,
        minArea,
        maxArea,
        minContributors,
        maxContributors,
        totalContributors,
        buildDate,
        totalSwipes,
        organizations,
        globalExportAssets,
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

    const assetConfig: Record<string, {
        heading: string;
        description: string;
        fileLabel: string;
    }> = {
        PROJECT_STATS_BY_TYPES: {
            heading: t('download-projects-overview-heading'),
            description: t('download-projects-overview-description'),
            fileLabel: 'CSV',
        },
        PROJECTS_CSV: {
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

    const totalAreaSum = sum(
        visibleProjects.map(
            (feature) => feature.aoiGeometry?.totalArea ?? 0,
        ).filter(isDefined),
    );
    const roundedTotalArea = Math.round((totalAreaSum / 1000)) * 1000;

    const tableProjects = visibleProjects.slice(0, items);

    const radiusSelector = useCallback(
        (project: PublicProject) => {
            if (bubble === 'area') {
                return 4 + 16 * (((project.aoiGeometry?.totalArea ?? 0) - minArea)
                    / (maxArea - minArea || 1));
            }
            if (bubble === 'contributors') {
                return 4 + 16 * (((project.numberOfContributorUsers ?? 0) - minContributors)
                    / (maxContributors - minContributors || 1));
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
                <Card
                    coverImageUrl="/img/completeness.png"
                    heading={t('type-completeness-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="COMPLETENESS"
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
                            type="VALIDATE_IMAGE"
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
                    heading={t('type-streets-view-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="STREET"
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
                    <>
                        {t('data-last-fetched', {
                            date: (new Date(Number(buildDate))),
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
                            href={`/[locale]/projects/${project.firebaseId}`}
                        >
                            <Card
                                className={styles.project}
                                coverImageUrl={project.image?.file?.url}
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
                                                {projectTypeOptionsMap[project.projectType]?.label}
                                            </Tag>
                                        )}
                                        {project.status && (
                                            <Tag
                                                spacing="small"
                                                icon={projectStatusOptionMap[project.status]?.icon}
                                            >
                                                {projectStatusOptionMap[project.status]?.label}
                                            </Tag>
                                        )}
                                    </div>
                                )}
                                footerContent={(
                                    <div className={styles.progressBar}>
                                        <div className={styles.track}>
                                            <div
                                                style={{ width: `${project.progress * 100}%` }}
                                                className={styles.progress}
                                            />
                                        </div>
                                        <div className={styles.progressLabel}>
                                            {t('project-card-progress-text', { progress: (project.progress * 100) })}
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
                                            <Tag
                                                tooltip={t('project-contributors')}
                                                className={styles.tag}
                                                icon={<IoPerson />}
                                                variant="transparent"
                                            >
                                                {t('project-card-contributors-text', { contributors: project.numberOfContributorUsers })}
                                            </Tag>
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
                {globalExportAssets.map((asset) => {
                    const config = assetConfig[asset.type];
                    if (!config) return null;

                    return (
                        <Card
                            key={asset.type}
                            childrenContainerClassName={styles.downloadCard}
                            heading={config.heading}
                            description={config.description}
                        >
                            <div className={styles.fileDetails}>
                                <Tag>{config.fileLabel}</Tag>
                                <div>
                                    {t('download-size', {
                                        size: getFileSizeProperties(asset.fileSize).size,
                                        formatParams: {
                                            size: {
                                                style: 'unit',
                                                unit: getFileSizeProperties(asset.fileSize).unit,
                                                maximumFractionDigits: 1,
                                            },
                                        },
                                    })}
                                </div>
                            </div>
                            <Link
                                href={asset.file.url}
                                variant="buttonTransparent"
                                className={styles.link}
                            >
                                <IoDownloadOutline />
                                {t('download')}
                            </Link>
                        </Card>
                    );
                })}
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
