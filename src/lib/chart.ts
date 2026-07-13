// Ported VERBATIM from the Next app's src/utils/chart.ts.
export interface Point {
  x: number;
  y: number;
}
export interface Boundary {
  min: number;
  max: number;
}

export function getScaleFunction(
  domain: Boundary,
  range: Boundary,
  offset: { start: number; end: number },
  inverted = false,
) {
  const rangeSize = range.max - range.min - (offset.start + offset.end);
  const domainSize = domain.max - domain.min;

  return (value: number) => {
    const normalizedValue = (value - domain.min) / domainSize;
    if (inverted) {
      return rangeSize + offset.start - rangeSize * normalizedValue;
    }
    return offset.start + rangeSize * normalizedValue;
  };
}

export function getBounds(numList: number[]) {
  if (!numList || numList.length === 0) {
    return { min: 0, max: 0 };
  }
  return { min: Math.min(...numList), max: Math.max(...numList) };
}

export function getPathData(pointList: readonly Point[] | undefined) {
  if (!pointList || pointList.length < 2) {
    return undefined;
  }
  return pointList
    .map((point, i) => (i === 0 ? `M${point.x} ${point.y}` : `L${point.x} ${point.y}`))
    .join(' ');
}

// bound() ported from @togglecorp/fujs.
export function bound(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
