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

import Link from 'components/Link';
import {
    rankedSearchOnList,
    projectNameMapping,
    projectTypes,
    projectStatuses,
    ProjectStatus,
    ProjectType,
} from 'utils/common';
import getProjectCentroids from 'utils/requests/projectCentroids';
import RawInput from 'components/RawInput';
import SelectInput from 'components/SelectInput';
import useDebouncedValue from 'hooks/useDebouncedValue';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

const DynamicProjectsMap = dynamic(() => import('components/ProjectsMap'), { ssr: false });

function keySelector<K extends { key: string }>(option: K) {
    return option.key;
}
function labelSelector<K extends { label: string }>(option: K) {
    return option.label;
}

const PAGE_SIZE = 9;

interface Props extends SSRConfig {
    className?: string;
    projects: {
        project_id: string;
        project_type: ProjectType,
        name: string;
        status: ProjectStatus;
        progress: number | null;
        number_of_users: number | null;
        coordinates: [number, number] | null;
        day: number | null;
    }[];
    totalArea: number;
    totalFinishedProjects: number;
}

function Data(props: Props) {
    const {
        className,
        projects,
        totalArea,
        totalFinishedProjects,
    } = props;

    const [items, setItems] = useState(PAGE_SIZE);
    const [searchText, setSearchText] = useState<string | undefined>();
    const [projectType, setProjectType] = useState<string | undefined>();
    const [projectStatus, setProjectStatus] = useState<string | undefined>();

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

    const tableProjects = visibleProjects.slice(0, items);

    return (
        <div
            className={_cs(styles.data, className)}
        >
            <div className={styles.stats}>
                <div>{t('total-area-card-text', { area: totalArea })}</div>
                <div>{t('finished-project-card-text', { projects: totalFinishedProjects })}</div>
            </div>

            <div
                className={styles.filters}
            >
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
            </div>

            <DynamicProjectsMap
                className={styles.projectsMap}
                projects={visibleProjects}
            />
            <div className={styles.projectList}>
                {tableProjects.map((project) => (
                    <div
                        className={styles.project}
                        key={project.project_id}
                    >
                        <Link
                            className={styles.projectName}
                            href={`/[locale]/projects/${project.project_id}`}
                        >
                            {project.name}
                        </Link>
                        <div>{t('project-card-status-text', { status: project.status })}</div>
                        <div>{t('project-card-type', { type: projectNameMapping[project.project_type] })}</div>
                        <div>{t('project-card-progress-text', { progress: project.progress })}</div>
                        <div>{t('project-card-contributors-text', { contributors: project.number_of_users })}</div>
                        <div>{t('project-card-last-update', { date: project.day })}</div>
                    </div>
                ))}
                {tableProjects.length !== visibleProjects.length && (
                    <button
                        onClick={handleSeeMore}
                        type="button"
                    >
                        {t('see-more-button')}
                    </button>
                )}
            </div>
        </div>
    );
}

export const getI18nPaths = () => (
    i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
        },
    }))
);

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
        coordinates: feature.geometry?.coordinates ?? null,
        day: feature.properties?.day
            ? new Date(feature.properties.day).getTime()
            : null,
    })).sort((foo, bar) => ((bar.day ?? 0) - (foo.day ?? 0)));

    const completedProjects = projects.features.filter(
        (feature) => feature.properties.status === 'finished',
    );

    const totalFinishedProjects = completedProjects.length;

    const totalArea = sum(
        completedProjects.map(
            (feature) => feature.properties.area_sqkm,
        ).filter(isDefined),
    );

    return {
        props: {
            ...translations,
            projects: miniProjects,
            totalArea: Math.round((totalArea / 1000)) * 1000,
            totalFinishedProjects,
        },
    };
};

export default Data;
