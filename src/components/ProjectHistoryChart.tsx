import React, { useEffect, useRef, useState, useMemo } from 'react';
import getProjectHistory from 'lib/projectHistory';
import { getBounds, getScaleFunction, getPathData, bound } from 'lib/chart';
// The timeline-chart SVG classes live in the recovered projects page module
// (Next kept them in src/pages/[locale]/projects/styles.module.css); importing
// the same module here yields the same hashed classes as the .astro page.
import styles from 'pages/[locale]/projects/styles.module.css';

// Self-contained port of the project-history chart from the Next `Project`
// component. Takes projectId + historyUrl, does its own fetch + SVG render,
// reusing chart.ts (getBounds/getScaleFunction/getPathData) and the ported
// projectHistory request. Hydrated with client:visible.

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 10;
const CHART_OFFSET = 10;

const chartMargin = {
    left: 2 * Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET * 3,
    bottom: 2 * X_AXIS_HEIGHT + CHART_OFFSET,
};

const xAxisFormatter = (date: Date) =>
    date.toLocaleString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });

// Ported from src/hooks/useSizeTracking.ts (ResizeObserver replaced with the
// browser-native one to avoid the resize-observer-polyfill dependency).
function useSizeTracking(ref: React.RefObject<HTMLElement | null>) {
    const [size, setSize] = useState(() => {
        const bcr = ref.current?.getBoundingClientRect();
        return { width: bcr?.width ?? 0, height: bcr?.height ?? 0 };
    });
    useEffect(() => {
        const ro = new ResizeObserver((entries) => {
            const rect = entries.at(0)?.contentRect;
            if (rect) setSize({ width: rect.width, height: rect.height });
        });
        const el = ref.current;
        if (el) ro.observe(el);
        return () => {
            if (el) ro.unobserve(el);
        };
    }, [ref]);
    return size;
}

interface Props {
    projectId: string;
    historyUrl?: string;
    emptyMessage?: string;
    className?: string;
}

export default function ProjectHistoryChart(props: Props) {
    const { projectId, historyUrl, emptyMessage = 'Not enough data points for the chart!', className } = props;

    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgBounds = useSizeTracking(svgContainerRef);
    const [projectHistory, setProjectHistory] = useState<
    { timestamp: number; progress: number }[] | undefined
    >();

    useEffect(() => {
        (async () => {
            try {
                if (historyUrl) {
                    const history = await getProjectHistory(projectId, historyUrl);
                    setProjectHistory(history);
                }
            } catch (err) {

                console.error('Failed fetching project data', err);
            }
        })();
    }, [historyUrl, projectId]);

    const [chartPoints, chartPointsForArea, xAxisTicks, yAxisTicks] = useMemo(() => {
        if (!projectHistory || projectHistory.length === 0) {
            return [[], [], [], []] as const;
        }
        const timestamps = projectHistory.map((ph) => ph.timestamp);
        const initialTimeBounds = getBounds(timestamps);

        const NUM_BREAKPOINT_X = 5;
        const timeDiff = initialTimeBounds.max - initialTimeBounds.min;
        const tickDuration = Math.ceil(timeDiff / NUM_BREAKPOINT_X);

        const timeBounds = {
            min: initialTimeBounds.min,
            max: initialTimeBounds.min + tickDuration * NUM_BREAKPOINT_X,
        };

        const xScale = getScaleFunction(
            timeBounds,
            { min: 0, max: svgBounds.width },
            { start: chartMargin.left, end: chartMargin.right },
        );
        const yScale = getScaleFunction(
            { min: 0, max: 100 },
            { min: 0, max: svgBounds.height },
            { start: chartMargin.top, end: chartMargin.bottom },
            true,
        );

        const percentageTicks = [0, 20, 40, 60, 80, 100].map((percentage) => ({
            value: percentage,
            y: yScale(percentage),
        }));

        const points = projectHistory.map((hist) => ({
            x: xScale(hist.timestamp),
            y: yScale(bound(100 * hist.progress, 0, 100)),
        }));

        const timeTicks = Array.from(Array(NUM_BREAKPOINT_X + 1)).map((_, i) => {
            const timestamp = initialTimeBounds.min + tickDuration * i;
            return { date: new Date(timestamp), timestamp, x: xScale(timestamp) };
        });

        return [
            points,
            [
                { x: xScale(timeBounds.min), y: svgBounds.height },
                ...points,
                { x: xScale(timeBounds.max), y: svgBounds.height },
            ],
            timeTicks,
            percentageTicks,
        ] as const;
    }, [projectHistory, svgBounds]);

    const hasData = projectHistory !== undefined && chartPoints.length > 1;

    return (
        <div ref={svgContainerRef} className={className ?? styles.timelineChartContainer}>
            {hasData ? (
                <svg className={styles.timelineChart}>
                    <defs>
                        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop className={styles.stopStart} offset="0%" />
                            <stop className={styles.stopEnd} offset="100%" />
                        </linearGradient>
                    </defs>
                    {yAxisTicks.map((point, i) => (
                        <React.Fragment key={point.value}>
                            <text className={styles.yAxisTickText} x={Y_AXIS_WIDTH} y={point.y + i * 2}>
                                {point.value}
                            </text>
                            <line
                                className={styles.yAxisGridLine}
                                x1={chartMargin.left - CHART_OFFSET}
                                y1={point.y}
                                x2={svgBounds.width - CHART_OFFSET}
                                y2={point.y}
                            />
                        </React.Fragment>
                    ))}
                    {xAxisTicks.map((tick) => (
                        <React.Fragment key={tick.timestamp}>
                            <text className={styles.xAxisTickText} x={tick.x} y={svgBounds.height - CHART_OFFSET}>
                                {xAxisFormatter(tick.date)}
                            </text>
                            <line
                                className={styles.xAxisGridLine}
                                x1={tick.x}
                                y1={0}
                                x2={tick.x}
                                y2={svgBounds.height - CHART_OFFSET}
                            />
                        </React.Fragment>
                    ))}
                    <path fill="url(#path-gradient)" d={getPathData(chartPointsForArea)} />
                    <path className={styles.path} d={getPathData(chartPoints)} />
                </svg>
            ) : (
                <div className={styles.emptyChart}>
                    <div className={styles.message}>{emptyMessage}</div>
                </div>
            )}
        </div>
    );
}
