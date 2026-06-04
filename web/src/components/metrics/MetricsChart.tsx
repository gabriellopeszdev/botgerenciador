'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMetricsContext } from '@/contexts/MetricsContext';
import type { MetricPoint } from '@/types/api';

interface Props {
    metric: 'cpuPercent' | 'ramMb';
    title:  string;
    color:  string;
    unit?:  string;
}

function buildPath(points: MetricPoint[], pick: (p: MetricPoint) => number, w: number, h: number) {
    if (points.length < 2) return { line: '', area: '', max: 0, last: 0 };
    const values = points.map(pick);
    const max = Math.max(...values, 1);
    const stepX = w / (points.length - 1);
    const coords = values.map((v, i) => [i * stepX, h - (v / max) * (h - 8) - 4] as const);
    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const area = `${line} L${w} ${h} L0 ${h} Z`;
    return { line, area, max, last: values[values.length - 1] ?? 0 };
}

export function MetricsChart({ metric, title, color, unit = '' }: Props) {
    const { history } = useMetricsContext();
    const w = 600, h = 120;
    const pick = (p: MetricPoint) => p[metric];
    const { line, area, max, last } = useMemo(() => buildPath(history, pick, w, h), [history, metric]);

    const pct = max > 0 ? (last / max) * 100 : 0;
    const isHot = metric === 'cpuPercent' && last > 75;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
                    <span className="text-sm font-semibold text-gray-200">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500">Pico: {max.toFixed(metric === 'cpuPercent' ? 1 : 0)}{unit}</span>
                    <span
                        className="text-sm font-bold font-mono"
                        style={{ color: isHot ? '#f87171' : color }}
                    >
                        {history.length > 0 ? `${last.toFixed(metric === 'cpuPercent' ? 1 : 0)}${unit}` : '—'}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                {history.length < 2 ? (
                    <div className="h-[120px] flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-gray-700 border-t-gray-500 rounded-full animate-spin" />
                        <span className="text-xs text-gray-600">Aguardando dados…</span>
                    </div>
                ) : (
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[120px]" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`grad-${metric}`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                            <filter id={`glow-${metric}`}>
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>
                        <path d={area} fill={`url(#grad-${metric})`} />
                        <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${metric})`} />
                    </svg>
                )}

                {/* Usage bar */}
                {history.length >= 2 && (
                    <div className="px-5 py-3 border-t border-border/40">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Utilização atual</span>
                            <span className="text-[10px] font-mono" style={{ color }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-surface2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: isHot ? '#f87171' : color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
