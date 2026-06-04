'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useMetricsContext } from '@/contexts/MetricsContext';

function formatUptime(seconds: number): string {
    if (seconds <= 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const spring = useSpring(value, { stiffness: 120, damping: 20 });
    const display = useTransform(spring, v => v.toFixed(decimals));

    useEffect(() => { spring.set(value); }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

const metrics = [
    {
        key: 'cpu',
        label: 'CPU',
        color: 'from-primary/10 to-primary/5',
        border: 'border-primary/20',
        text: 'text-primary-light',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
                <path d="M9 2v2M15 2v2M9 22v-2M15 22v-2M2 9h2M2 15h2M22 9h-2M22 15h-2" />
            </svg>
        ),
    },
    {
        key: 'ram',
        label: 'Memória',
        color: 'from-emerald-500/20 to-emerald-600/5',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2" />
            </svg>
        ),
    },
    {
        key: 'rooms',
        label: 'Salas Online',
        color: 'from-blue-500/20 to-blue-600/5',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        key: 'uptime',
        label: 'Uptime Bot',
        color: 'from-amber-500/20 to-amber-600/5',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
            </svg>
        ),
    },
];

export function MetricsBar() {
    const { current } = useMetricsContext();

    const values = [
        { display: current ? <><AnimatedNumber value={current.cpu} decimals={1} />%</> : '—', sub: current ? `de 100%` : '—' },
        { display: current ? <><AnimatedNumber value={current.ramMb} /> MB</> : '—', sub: 'em uso' },
        { display: current ? <AnimatedNumber value={current.roomsOnline} /> : '—', sub: current?.roomsOnline === 1 ? 'sala ativa' : 'salas ativas' },
        { display: current ? formatUptime(current.botUptime) : '—', sub: 'de atividade' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map(({ key, label, color, border, text, icon }, i) => (
                <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
                    className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 relative overflow-hidden`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <span className={`${text} opacity-80`}>{icon}</span>
                        {!current && <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />}
                    </div>
                    <div className="text-2xl font-bold text-white font-data tabular-nums">
                        {values[i]!.display}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-semibold uppercase tracking-widest">{label}</div>
                    <div className={`text-[10px] ${text} opacity-60 mt-0.5`}>{values[i]!.sub}</div>
                </motion.div>
            ))}
        </div>
    );
}
