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
    offset: {
        start: number,
        end: number,
    },
    inverted = false,
) {
    const rangeSize = (range.max - range.min) - (offset.start + offset.end);
    const domainSize = domain.max - domain.min;

    return (value: number) => {
        const normalizedValue = (value - domain.min) / domainSize;

        if (inverted) {
            return (rangeSize + offset.start) - (rangeSize * normalizedValue);
        }

        return offset.start + rangeSize * normalizedValue;
    };
}

export function getBounds(numList: number[]) {
    if (!numList || numList.length === 0) {
        return {
            min: 0,
            max: 0,
        };
    }

    return {
        min: Math.min(...numList),
        max: Math.max(...numList),
    };
}

export function getPathData(pointList: Point[] | undefined) {
    if (!pointList || pointList.length < 2) {
        return undefined;
    }

    return pointList.map((point, i) => {
        if (i === 0) {
            return `M${point.x} ${point.y}`;
        }

        return `L${point.x} ${point.y}`;
    }).join(' ');
}
