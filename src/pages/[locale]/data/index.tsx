import React from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { _cs, sum, isDefined } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Link from 'components/Link';
import getProjectCentroids, { ProjectStatus } from 'utils/requests/projectCentroids';
import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

const DynamicProjectsMap = dynamic(() => import('components/ProjectsMap'), { ssr: false });

interface Props extends SSRConfig {
    className?: string;
    projects: {
        project_id: string;
        name: string;
        status: ProjectStatus;
        progress: number | null;
        number_of_users: number | null;
        coordinates: [number, number] | null;
    }[];
    totalArea: number;
    totalFinishedProjects: number;
}

const pageSize = 10;

function Data(props: Props) {
    const {
        className,
        projects,
        totalArea,
        totalFinishedProjects,
    } = props;

    const { t } = useTranslation('data');

    return (
        <div
            className={_cs(styles.data, className)}
        >
            <div className={styles.stats}>
                <div>{t('total-area-card-text', { area: totalArea })}</div>
                <div>{t('finished-project-card-text', { projects: totalFinishedProjects })}</div>
            </div>
            <DynamicProjectsMap
                className={styles.projectsMap}
                projects={projects}
            />
            <div className={styles.projectList}>
                {projects.slice(0, pageSize).map((project) => (
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
                        <div>{t('project-card-progress-text', { progress: project.progress })}</div>
                        <div>{t('project-card-contributors-text', { contributors: project.number_of_users })}</div>
                    </div>
                ))}
                <div>
                    {t('project-pagination-text', { remainingProjects: projects.length - pageSize })}
                </div>
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
        name: feature.properties.name ?? null,
        status: feature.properties.status ?? null,
        progress: feature.properties.progress !== null && feature.properties.progress !== undefined
            ? Math.round(feature.properties.progress * 100)
            : null,
        number_of_users: feature.properties.number_of_users ?? null,
        coordinates: feature.geometry?.coordinates ?? null,
    }));

    const completedProjects = projects.features.filter(
        (feature) => (
            feature.properties.status === 'finished'
            || feature.properties.status === 'archived'
        ),
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
