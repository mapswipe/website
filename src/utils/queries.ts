export interface GlobalExportAssets {
    type: string;
    lastUpdatedAt: string;
    fileSize: number;
    file: {
        name: string;
        url: string;
    };
}

export interface UrlInfo {
    id: string;
    fileSize: number;
    file: {
        url: string;
        name: string;
    };
    mimetype: string;
    modifiedAt?: string;
}

export interface Feature {
    type: 'Feature';
    geometry: {
        type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString' | string;
        coordinates: [number, number] | undefined;
    };
    properties: {
        [key: string]: any;
    } | null;
}

export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
}
