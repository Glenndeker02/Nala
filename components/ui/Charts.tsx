'use client';

import { useMemo } from 'react';

interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

interface SimpleBarChartProps {
    data: DataPoint[];
    title?: string;
    height?: number;
    valuePrefix?: string;
    valueSuffix?: string;
}

const COLORS = [
    '#6366f1', // indigo
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
];

export function SimpleBarChart({
    data,
    title,
    height = 200,
    valuePrefix = '',
    valueSuffix = ''
}: SimpleBarChartProps) {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

    if (data.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                No data available
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-4">
            {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
            <div className="flex items-end gap-2" style={{ height }}>
                {data.map((item, idx) => {
                    const barHeight = (item.value / maxValue) * 100;
                    const color = item.color || COLORS[idx % COLORS.length];

                    return (
                        <div
                            key={item.label}
                            className="flex-1 flex flex-col items-center"
                        >
                            <div
                                className="relative w-full group"
                                style={{ height: `${height - 40}px` }}
                            >
                                <div
                                    className="absolute bottom-0 w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                                    style={{
                                        height: `${barHeight}%`,
                                        backgroundColor: color,
                                        minHeight: item.value > 0 ? '4px' : '0'
                                    }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                        {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 truncate max-w-full text-center">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface SimplePieChartProps {
    data: DataPoint[];
    title?: string;
    size?: number;
}

export function SimplePieChart({ data, title, size = 160 }: SimplePieChartProps) {
    const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    const segments = useMemo(() => {
        let currentAngle = 0;
        return data.map((item, idx) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            return {
                ...item,
                percentage,
                startAngle,
                endAngle: currentAngle,
                color: item.color || COLORS[idx % COLORS.length]
            };
        });
    }, [data, total]);

    if (data.length === 0 || total === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                No data available
            </div>
        );
    }

    const createArcPath = (startAngle: number, endAngle: number, radius: number, cx: number, cy: number) => {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    const radius = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <div className="bg-white rounded-lg border p-4">
            {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
            <div className="flex items-center gap-4">
                <svg width={size} height={size} className="flex-shrink-0">
                    {segments.map((segment, idx) => (
                        <path
                            key={segment.label}
                            d={createArcPath(segment.startAngle, segment.endAngle, radius, cx, cy)}
                            fill={segment.color}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <title>{segment.label}: {segment.percentage.toFixed(1)}%</title>
                        </path>
                    ))}
                </svg>
                <div className="flex-1">
                    <div className="space-y-2">
                        {segments.slice(0, 5).map((segment) => (
                            <div key={segment.label} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-gray-700 truncate">{segment.label}</span>
                                <span className="text-gray-500 ml-auto">{segment.percentage.toFixed(0)}%</span>
                            </div>
                        ))}
                        {segments.length > 5 && (
                            <div className="text-xs text-gray-400">+{segments.length - 5} more</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TrendLineProps {
    data: { label: string; value: number }[];
    title?: string;
    height?: number;
    color?: string;
}

export function TrendLine({ data, title, height = 80, color = '#6366f1' }: TrendLineProps) {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    const minValue = useMemo(() => Math.min(...data.map(d => d.value), 0), [data]);
    const range = maxValue - minValue || 1;

    const width = 300;
    const padding = 10;

    const points = useMemo(() => {
        return data.map((d, idx) => {
            const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
            const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
            return { x, y, value: d.value, label: d.label };
        });
    }, [data, height, width, minValue, range]);

    const linePath = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    if (data.length < 2) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border p-4">
            {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {points.map((p, idx) => (
                    <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill="white"
                        stroke={color}
                        strokeWidth={2}
                        className="cursor-pointer"
                    >
                        <title>{p.label}: {p.value}</title>
                    </circle>
                ))}
            </svg>
        </div>
    );
}
