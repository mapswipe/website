import React, { useMemo } from 'react';
import { isDefined, listToMap } from '@togglecorp/fujs';
import {
    MapContainer,
    TileLayer,
    Popup,
    CircleMarker,
} from 'react-leaflet';
import { useTranslation } from 'next-i18next';
import { CircleMarkerOptions, LatLngTuple } from 'leaflet';

import Card from 'components/Card';
import ProjectTypeIcon from 'components/ProjectTypeIcon';
import Tag from 'components/Tag';
import {
    IoLocationOutline,
    IoFlag,
    IoPerson,
    IoCalendarClearOutline,
    IoEllipseSharp,
} from 'react-icons/io5';

import {
    ProjectTypeOption,
    ProjectStatusOption,
    ProjectStatus,
} from 'utils/common';

import GestureHandler from 'components/LeafletGestureHandler';
import Link from 'components/Link';
import { ProjectQuery } from '../../../generated/types';

import styles from './styles.module.css';

const pathOptions: {
    [key in ProjectStatus]?: CircleMarkerOptions
} = {
    PUBLISHED: {
        fillColor: '#F69143',
        color: '#0F193F',
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.9,
    },
    FINISHED: {
        fillColor: '#AABE5D',
        color: '#0F193F',
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.9,
    },
};

const defaultPathOptions: CircleMarkerOptions = {
    fillColor: '#0F193F',
    color: '#0F193F',
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.9,
};

interface Props {
    className?: string;
    children?: React.ReactNode;
    projects: ProjectQuery[];
    radiusSelector: (project: ProjectQuery) => number;
}

function ProjectMap(props: Props) {
    const {
        className,
        children,
        projects,
        radiusSelector,
    } = props;

    const { t } = useTranslation('data');

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

    const sanitizedProjects = projects
        .map((project) => (isDefined(project?.aoiGeometry?.centroid) ? {
            ...project,
            centroid: [
                project.aoiGeometry?.centroid[1],
                project.aoiGeometry?.centroid[0],
            ] as LatLngTuple,
        } : undefined))
        .filter(isDefined);

    return (
        <MapContainer
            center={[40.866667, 34.566667]}
            zoom={2}
            className={className}
            maxZoom-={13}
            minZoom={1}
            worldCopyJump
        >
            {sanitizedProjects.map((project) => (
                <CircleMarker
                    key={project.id}
                    center={project.centroid}
                    radius={radiusSelector(project)}
                    pathOptions={pathOptions[project.status] ?? defaultPathOptions}
                >
                    <Popup>
                        <Link
                            className={styles.cardLink}
                            key={project.id}
                            href={`/[locale]/projects/${project.id}`}
                        >
                            <Card
                                className={styles.project}
                                // coverImageUrl={project.image ?? undefined}
                                headingFont="normal"
                                heading={project.name}
                                description={(
                                    <div className={styles.types}>
                                        {project.projectType && (
                                            <Tag
                                                spacing="small"
                                                icon={(
                                                    projectTypeOptionsMap[project.projectType].icon
                                                )}
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
                                    <div className={styles.bottomTags}>
                                        {project.region && (
                                            <Tag
                                                className={styles.tag}
                                                icon={<IoLocationOutline />}
                                                variant="transparent"
                                            >
                                                {project.region}
                                            </Tag>
                                        )}
                                        {project.requestingOrganization && (
                                            <Tag
                                                className={styles.tag}
                                                icon={<IoFlag />}
                                                variant="transparent"
                                            >
                                                {project?.requestingOrganization.name}
                                            </Tag>
                                        )}
                                        <div className={styles.row}>
                                            {project.modifiedAt && (
                                                <Tag
                                                    className={styles.tag}
                                                    icon={<IoCalendarClearOutline />}
                                                    variant="transparent"
                                                >
                                                    {t(
                                                        'project-card-last-update',
                                                        {
                                                            date: project.modifiedAt
                                                                ? new Date(project.modifiedAt)
                                                                    .toLocaleDateString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    }) : null,
                                                        },
                                                    )}
                                                </Tag>
                                            )}
                                            <Tag
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
                    </Popup>
                </CircleMarker>
            ))}
            <GestureHandler />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
            />
            {children}
        </MapContainer>
    );
}

export default ProjectMap;
