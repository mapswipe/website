// Ported verbatim from the Next app's src/utils/common.ts (relevant helpers only).
const mb = 1024 * 1024;

export function getFileSizeProperties(fileSize: number) {
  if (fileSize > mb / 10) {
    return { size: fileSize / mb, unit: 'megabyte' as const };
  }
  return { size: fileSize / 1024, unit: 'kilobyte' as const };
}

import type { Project } from './data';

// Ported from the Next page's transformAoiToGeoJson.
export function transformAoiToGeoJson(aoi: Project['aoiGeometry']) {
  if (!aoi || !aoi.bbox) return undefined;
  return {
    type: 'FeatureCollection',
    features: [
      {
        geometry: { type: 'Polygon', coordinates: aoi.bbox },
        type: 'Feature',
        properties: {},
      },
    ],
  } as const;
}

// Ported from the Next page's aoiDownload priority chain.
export function resolveAoiDownload(project: Project) {
  const { aoiGeometryInputAsset, exportAreaOfInterest, aoiGeometry } = project;
  if (aoiGeometryInputAsset?.file?.url) {
    return {
      kind: 'link' as const,
      url: aoiGeometryInputAsset.file.url,
      mimetype: aoiGeometryInputAsset.mimetype,
      fileSize: aoiGeometryInputAsset.fileSize ?? 0,
    };
  }
  if (exportAreaOfInterest?.file?.url) {
    return {
      kind: 'link' as const,
      url: exportAreaOfInterest.file.url,
      mimetype: exportAreaOfInterest.mimetype,
      fileSize: exportAreaOfInterest.fileSize ?? 0,
    };
  }
  const feature = transformAoiToGeoJson(aoiGeometry);
  if (feature) {
    const geojson = JSON.stringify(feature);
    return {
      kind: 'data' as const,
      url: `data:application/geo+json;charset=utf-8,${encodeURIComponent(geojson)}`,
      mimetype: 'GEOJSON',
      fileSize: new TextEncoder().encode(geojson).length,
    };
  }
  return undefined;
}
