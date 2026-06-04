'use client';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoomLog } from '@/types/api';

const TYPE_CONFIG: Record<RoomLog['type'], { color: string; bg: string; border: string; dot: string }> = {
    INFO:          { color: 'text-gray-400',    bg: 'bg-gray-500/5',     border: 'border-gray-500/10',  dot: 'bg-gray-500'    },
    SUCCESS:       { color: 'text-emerald-400', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15',dot: 'bg-emerald-400' },
    WARN:          { color: 'text-amber-400',   bg: 'bg-amber-500/8',    border: 'border-amber-500/15', dot: 'bg-amber-400'   },
    ERROR:         { color: 'text-red-400',     bg: 'bg-red-500/8',      border: 'border-red-500/15',   dot: 'bg-red-400'     },
    CRASH:         { color: 'text-red-300',     bg: 'bg-red-500/10',     border: 'border-red-500/20',   dot: 'bg-red-300'     },
    TOKEN_EXPIRED: { color: 'text-amber-300',   bg: 'bg-amber-500/8',    border: 'border-amber-500/15', dot: 'bg-amber-300'   },
    COMMAND:       { color: 'text-blue-400',    bg: 'bg-blue-500/8',     border: 'border-blue-500/15',  dot: 'bg-blue-400'    },
};

const TYPES: RoomLog['type'][] = ['INFO', 'SUCCESS', 'WARN', 'ERROR', 'CRASH', 'TOKEN_EXPIRED', 'COMMAND'];

interface Props {
    logs:      (RoomLog & { roomId?: string })[];
    isLoading: boolean;
    showRoom?: boolean;
}

export function LogViewer({ logs, isLoading, showRoom }: Props) {
    const [active,     setActive]     = useState<Set<RoomLog['type']>>(new Set(TYPES));
    const [search,     setSearch]     = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return logs.filter(l => active.has(l.type) && (!q || l.message.toLowerCase().includes(q)));
    }, [logs, active, search]);

    useEffect(() => {
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [filtered, autoScroll]);

    const counts = useMemo(() => {
        const m: Record<string, number> = {};
        for (const l of logs) m[l.type] = (m[l.type] ?? 0) + 1;
        return m;
    }, [logs]);

    function toggle(t: RoomLog['type']) {
        const next = new Set(active);
        if (next.has(t)) next.delete(t); else next.add(t);
        setActive(next);
    }

    if (isLoading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-600">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/></svg>
                Carregando logs…
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border/60">
                <div className="flex gap-1.5 flex-wrap">
                    {TYPES.map(t => {
                        const cfg   = TYPE_CONFIG[t];
                        const isOn  = active.has(t);
                        const count = counts[t] ?? 0;
                        return (
                            <motion.button
                                key={t}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggle(t)}
                                className={clsx(
                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border transition-all duration-150',
                                    isOn ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-surface3/60 border-border/60 text-gray-600',
                                )}
                            >
                                <span className={clsx('w-1.5 h-1.5 rounded-full', isOn ? cfg.dot : 'bg-gray-700')} />
                                {t}
                                <span className={clsx('opacity-60', !isOn && 'opacity-30')}>({count})</span>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" className="pl-7 py-1.5 text-xs w-36" />
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer select-none whitespace-nowrap">
                        <div
                            onClick={() => setAutoScroll(s => !s)}
                            className={clsx('w-7 h-4 rounded-full border transition-all duration-200 relative cursor-pointer', autoScroll ? 'bg-primary/30 border-primary/40' : 'bg-surface3 border-border/60')}
                        >
                            <div className={clsx('absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200', autoScroll ? 'left-3.5 bg-primary-light' : 'left-0.5 bg-gray-600')} />
                        </div>
                        auto-scroll
                    </label>
                </div>
            </div>

            {/* Log entries */}
            <div
                ref={containerRef}
                className="font-mono text-xs overflow-auto max-h-[60vh] p-2 space-y-0.5"
            >
                {filtered.length === 0 ? (
                    <div className="text-center text-sm text-gray-600 py-10">
                        {logs.length === 0 ? 'Nenhum log ainda.' : 'Nenhum log corresponde aos filtros.'}
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map((log, i) => {
                            const cfg = TYPE_CONFIG[log.type];
                            return (
                                <motion.div
                                    key={`${log.id}-${i}`}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className={clsx(
                                        'flex items-start gap-3 px-3 py-2 rounded-lg border transition-colors',
                                        cfg.bg, cfg.border,
                                        'hover:brightness-110',
                                    )}
                                >
                                    <span className="text-gray-600 shrink-0 tabular-nums">
                                        {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                                    </span>
                                    <span className={clsx('shrink-0 font-bold w-14 text-right', cfg.color)}>
                                        {log.type}
                                    </span>
                                    {showRoom && log.roomId && (
                                        <span className="text-gray-600 shrink-0 tabular-nums">[{log.roomId.slice(0, 6)}]</span>
                                    )}
                                    <span className="text-gray-300 break-words leading-relaxed">{log.message}</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
