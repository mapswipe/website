import React from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import getProjectCentroids, { ProjectStatus } from 'utils/requests/projectCentroids';
import getProjectGeometries from 'utils/requests/projectGeometries';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// import Link from 'components/Link';
import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

const DynamicProjectMap = dynamic(() => import('components/ProjectMap'), { ssr: false });

interface Props extends SSRConfig {
    className?: string;
    totalProgress: number | null;
    totalArea: number | null;
    totalContributors: number | null;
    name: string;
    description: string;
    status: ProjectStatus;
    projectGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> | null;
}

function Project(props: Props) {
    const {
        className,
        totalProgress,
        totalArea,
        totalContributors,
        name,
        description,
        status,
        projectGeoJSON,
    } = props;

    const { t } = useTranslation('project');

    return (
        <div
            className={_cs(styles.project, className)}
        >
            <h1>
                {name}
            </h1>
            <p>
                {description}
            </p>
            <div className={styles.stats}>
                <div>{t('project-status-text', { status })}</div>
                <div>{t('project-progress-text', { progress: totalProgress })}</div>
                <div>{t('project-total-area-text', { area: totalArea })}</div>
                <div>{t('project-contributors-text', { contributors: totalContributors })}</div>
            </div>
            {projectGeoJSON && (
                <DynamicProjectMap
                    className={styles.projectsMap}
                    geoJSON={projectGeoJSON}
                />
            )}
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

    const historyRequest = await fetch(`https://apps.mapswipe.org/api/history/history_${projectId}.csv`);
    const history = await historyRequest.text();

    const urls = [
        `https://apps.mapswipe.org/api/agg_results/agg_results_${projectId}.csv.gz`,
        `https://apps.mapswipe.org/api/agg_results/agg_results_${projectId}_geom.geojson.gz`,
        `https://apps.mapswipe.org/api/hot_tm/hot_tm_${projectId}.geojson`,
        `https://apps.mapswipe.org/api/yes_maybe/yes_maybe_${projectId}.geojson`,
        `https://apps.mapswipe.org/api/groups/groups_${projectId}.csv.gz`,
        `https://apps.mapswipe.org/api/history/history_${projectId}.csv`,
        `https://apps.mapswipe.org/api/results/results_${projectId}.csv.gz`,
        `https://apps.mapswipe.org/api/tasks/tasks_${projectId}.csv.gz`,
        `https://apps.mapswipe.org/api/users/users_${projectId}.csv.gz`,
        `https://apps.mapswipe.org/api/project_geometries/project_geom_${projectId}.geojson`,
    ];

    const urlResponses = urls.map(async (url) => {
        const res = await fetch(url, { method: 'HEAD' });
        return {
            url,
            ok: res.ok,
        };
    });

    const urlResponsesFinal = await Promise.all(urlResponses);

    return {
        props: {
            ...translations,
            totalProgress: (
                project.properties.progress !== null
                && project.properties.progress !== undefined
            )
                ? Math.round(project.properties.progress * 100)
                : null,
            totalArea: Math.round(project.properties.area_sqkm ?? 0),
            totalContributors: project.properties.number_of_users ?? null,
            name: project.properties.name,
            description: project.properties.project_details,
            status: project.properties.status,
            projectGeoJSON: geojson ?? null,
            history,
            urls: urlResponsesFinal,
        },
    };
};

export default Project;
