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
    ProjectType,
} from 'utils/common';

import GestureHandler from 'components/LeafletGestureHandler';
import Link from 'components/Link';

import styles from './styles.module.css';

const pathOptions: {
    [key in ProjectStatus]?: CircleMarkerOptions
} = {
    active: {
        fillColor: '#F69143',
        color: '#0F193F',
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.9,
    },
    finished: {
        fillColor: '#AABE5D',
        color: '#0F193F',
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.9,
    },
};

const sortValue: {
    [key in ProjectStatus]?: number
} = {
    active: 3,
    finished: 2,
    archived: 1,
};

const defaultPathOptions: CircleMarkerOptions = {
    fillColor: '#0F193F',
    color: '#0F193F',
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.9,
};

interface Project {
    project_id: string;
    project_type: ProjectType,
    name: string;
    status: ProjectStatus;
    progress: number | null;
    number_of_users: number | null;
    coordinates: [number, number] | null;
    day: number | null;
    area_sqkm: number | null;
    region: string | null;
    requestingOrganization: string | null;
}

interface Props {
    className?: string;
    children?: React.ReactNode;
    projects: Project[];
    radiusSelector: (project: Project) => number;
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
    ]), [t]);

    const projectTypeOptionsMap = useMemo(() => (
        listToMap(
            projectTypeOptions,
            (item) => item.key,
            (item) => item,
        )
    ), [projectTypeOptions]);

    const sanitizedProjects = projects
        .map((project) => (isDefined(project.coordinates) ? {
            ...project,
            coordinates: [project.coordinates[1], project.coordinates[0]] as LatLngTuple,
        } : undefined))
        .filter(isDefined)
        .sort((foo, bar) => ((sortValue[foo.status] ?? 0) - (sortValue[bar.status] ?? 0)));

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
                    key={project.project_id}
                    center={project.coordinates}
                    radius={radiusSelector(project)}
                    pathOptions={pathOptions[project.status] ?? defaultPathOptions}
                >
                    <Popup>
                        <Link
                            className={styles.cardLink}
                            key={project.project_id}
                            href={`/[locale]/projects/${project.project_id}`}
                        >
                            <Card
                                className={styles.project}
                                // coverImageUrl={project.image ?? undefined}
                                headingFont="normal"
                                heading={project.name}
                                description={(
                                    <div className={styles.row}>
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
                                                {project.requestingOrganization}
                                            </Tag>
                                        )}
                                        <div className={styles.row}>
                                            {project.day && (
                                                <Tag
                                                    className={styles.tag}
                                                    icon={<IoCalendarClearOutline />}
                                                    variant="transparent"
                                                >
                                                    {t('project-card-last-update', { date: project.day })}
                                                </Tag>
                                            )}
                                            {project.number_of_users && (
                                                <Tag
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
