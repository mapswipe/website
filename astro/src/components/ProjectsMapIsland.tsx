import React, { useMemo } from 'react';
import type { CircleMarkerOptions, LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import type { MiniProject } from '../lib/dataExplorer';

// Client-ONLY leaflet map for the data explorer. This module statically imports
// leaflet/react-leaflet (which touch window at import time), so it must NEVER be
// imported during SSR. DataExplorer loads it via React.lazy(() => import(...))
// deferred behind a post-mount flag, so the static leaflet import only runs in the
// browser. Ported from the Next app's ProjectsMap (circle markers, per-status
// colors, popups).

const pathOptions: Record<string, CircleMarkerOptions> = {
  PUBLISHED: { fillColor: '#F69143', color: '#0F193F', weight: 1, opacity: 0.2, fillOpacity: 0.9 },
  FINISHED: { fillColor: '#AABE5D', color: '#0F193F', weight: 1, opacity: 0.2, fillOpacity: 0.9 },
};
const defaultPathOptions: CircleMarkerOptions = {
  fillColor: '#0F193F', color: '#0F193F', weight: 1, opacity: 0.3, fillOpacity: 0.9,
};

function isDefined<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

interface Props {
  projects: MiniProject[];
  radiusSelector: (p: MiniProject) => number;
  typeLabels: Record<string, string>;
  statusLabels: Record<string, string>;
}

export default function ProjectsMapIsland(props: Props) {
  const { projects, radiusSelector, typeLabels, statusLabels } = props;

  const sanitized = useMemo(
    () =>
      projects
        .map((project) =>
          isDefined(project.aoiGeometry?.centroid)
            ? {
                project,
                centroid: [
                  project.aoiGeometry!.centroid![1],
                  project.aoiGeometry!.centroid![0],
                ] as LatLngTuple,
              }
            : undefined,
        )
        .filter(isDefined),
    [projects],
  );

  return (
    <MapContainer
      center={[40.866667, 34.566667]}
      zoom={2}
      style={{ height: '100%', width: '100%', minHeight: 420 }}
      maxZoom={13}
      minZoom={1}
      worldCopyJump
    >
      {sanitized.map(({ project, centroid }) => (
        <CircleMarker
          key={project.id}
          center={centroid}
          radius={radiusSelector(project)}
          pathOptions={project.status ? (pathOptions[project.status] ?? defaultPathOptions) : defaultPathOptions}
        >
          <Popup>
            <a className="de-popup-link" href={`/projects/${project.firebaseId}/`}>
              <strong>{project.name}</strong>
              <div className="de-popup-tags">
                {project.projectType && <span className="de-tag">{typeLabels[project.projectType] ?? project.projectType}</span>}
                {project.status && <span className="de-tag">{statusLabels[project.status] ?? project.status}</span>}
              </div>
            </a>
          </Popup>
        </CircleMarker>
      ))}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
    </MapContainer>
  );
}
