import React, { useRef, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    GeoJSON,
} from 'react-leaflet';
import { Map, LayerEvent } from 'leaflet';

import GestureHandler from 'components/LeafletGestureHandler';

interface Props {
    className?: string;
    children?: React.ReactNode;
    geoJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
}

function ProjectMap(props: Props) {
    const {
        className,
        children,
        geoJSON,
    } = props;

    const mapRef = useRef<Map>(null);

    const handleGeoJSONAdd = useCallback(
        (layer: LayerEvent) => {
            const bounds = layer.target?.getBounds();
            if (bounds) {
                mapRef.current?.fitBounds(bounds, { padding: [12, 12] });
            }
        },
        [],
    );

    return (
        <MapContainer
            ref={mapRef}
            center={[40.866667, 34.566667]}
            zoom={2}
            className={className}
            maxZoom-={13}
            minZoom={1}
            worldCopyJump
        >
            <GeoJSON
                data={geoJSON}
                eventHandlers={{
                    add: handleGeoJSONAdd,
                }}
                pathOptions={{
                    fillColor: '#AABE5D',
                    color: '#AABE5D',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.1,
                }}
            />
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
