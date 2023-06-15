import React from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    MapContainer,
    TileLayer,
    Popup,
    CircleMarker,
} from 'react-leaflet';
import { useTranslation } from 'next-i18next';
import { CircleMarkerOptions, LatLngTuple } from 'leaflet';

import {
    projectNameMapping,
    ProjectStatus,
    ProjectType,
} from 'utils/common';

import GestureHandler from 'components/LeafletGestureHandler';
import Link from 'components/Link';

const pathOptions: {
    [key in ProjectStatus]?: CircleMarkerOptions
} = {
    active: {
        radius: 8,
        fillColor: '#F69143',
        color: 'black',
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.9,
    },
    finished: {
        radius: 5,
        fillColor: '#0060C9',
        color: 'black',
        weight: 1,
        opacity: 0.4,
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
    radius: 5,
    fillColor: '#A1A1A1',
    color: 'black',
    weight: 1,
    opacity: 0.4,
    fillOpacity: 0.9,
};

interface Props {
    className?: string;
    children?: React.ReactNode;
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
}

function ProjectMap(props: Props) {
    const {
        className,
        children,
        projects,
    } = props;

    const { t } = useTranslation('data');

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
                    radius={10}
                    pathOptions={pathOptions[project.status] ?? defaultPathOptions}
                >
                    <Popup>
                        <Link
                            href={`/[locale]/projects/${project.project_id}`}
                        >
                            {project.name}
                            {project.status}
                        </Link>
                        <div>{t('project-card-status-text', { status: project.status })}</div>
                        <div>{t('project-card-type', { type: projectNameMapping[project.project_type] })}</div>
                        <div>{t('project-card-progress-text', { progress: project.progress })}</div>
                        <div>{t('project-card-contributors-text', { contributors: project.number_of_users })}</div>
                        <div>{t('project-card-last-update', { date: project.day })}</div>
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
