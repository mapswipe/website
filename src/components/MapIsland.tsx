import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Map as LeafletMap, LayerEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Faithful port of the Next app's src/components/ProjectMap. Fetches the AOI
// GeoJSON (real file URL or a data: URL fallback) and fits bounds to it.
// Hydrated with client:only="react" (parity with Next's dynamic ssr:false).

interface Props {
  className?: string;
  geoJsonUrl: string;
}

export default function MapIsland(props: Props) {
  const { className, geoJsonUrl } = props;
  const mapRef = useRef<LeafletMap>(null);
  const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(geoJsonUrl);
        const d = await res.json();
        if (active) setGeoJson(d);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed fetching map GeoJSON', geoJsonUrl, err);
      }
    })();
    return () => {
      active = false;
    };
  }, [geoJsonUrl]);

  const handleGeoJSONAdd = useCallback((layer: LayerEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds = (layer.target as any)?.getBounds?.();
    if (bounds) {
      mapRef.current?.fitBounds(bounds, { padding: [12, 12] });
    }
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={[40.866667, 34.566667]}
      zoom={2}
      className={className}
      style={{ height: '100%', minHeight: 320, width: '100%' }}
      maxZoom={13}
      minZoom={1}
      worldCopyJump
    >
      {geoJson && (
        <GeoJSON
          key={geoJsonUrl}
          data={geoJson}
          eventHandlers={{ add: handleGeoJSONAdd }}
          pathOptions={{
            fillColor: '#AABE5D',
            color: '#AABE5D',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.1,
          }}
        />
      )}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
    </MapContainer>
  );
}
