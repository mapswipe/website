import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
} from 'react';
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
    // NOTE: URL to a GeoJSON file which the map fetches and renders. fetch
    // supports data: URLs too, so a client-built fallback can be passed the
    // same way as a real file URL.
    geoJsonUrl: string;
}

function ProjectMap(props: Props) {
    const {
        className,
        children,
        geoJsonUrl,
    } = props;

    const mapRef = useRef<Map>(null);
    const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>();

    useEffect(() => {
        // NOTE: Handle component dismount gracefully
        let active = true;

        async function loadGeoJson(url: string) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (active) {
                    setGeoJson(data);
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed fetching map GeoJSON', url, err);
            }
        }

        loadGeoJson(geoJsonUrl);

        return () => {
            active = false;
        };
    }, [geoJsonUrl]);

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
            {geoJson && (
                <GeoJSON
                    // NOTE: react-leaflet's GeoJSON only reads `data` on mount,
                    // so key it to the source to remount when the data changes.
                    key={geoJsonUrl}
                    data={geoJson}
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
            )}
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
