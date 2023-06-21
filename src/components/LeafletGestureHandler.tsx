import { useEffect } from 'react';
import { GestureHandling } from 'leaflet-gesture-handling';
import { useMap } from 'react-leaflet';
import { Map } from 'leaflet';

import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

interface ExtendedMap extends Map {
    gestureHandling: {
        enable: () => void;
    };
}

function GestureHandler() {
    const map = useMap();
    useEffect(
        () => {
            if (!map) {
                return;
            }
            map.addHandler('gestureHandling', GestureHandling);
            (map as ExtendedMap).gestureHandling.enable();
        },
        [map],
    );
    return null;
}

export default GestureHandler;
