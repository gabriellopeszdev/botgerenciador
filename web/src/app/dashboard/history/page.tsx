'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge }      from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { HistoryRepository } from '@/core/repositories/HistoryRepository';
import type { RoomHistory } from '@/types/api';

const statusConfig: Record<RoomHistory['status'], { color: 'green' | 'gray' | 'red'; label: string; icon: string }> = {
    ONLINE:  { color: 'green', label: 'Online',   icon: '🟢' },
    OFFLINE: { color: 'gray',  label: 'Offline',  icon: '⚪' },
    CRASHED: { color: 'red',   label: 'Crash',    icon: '💥' },
};

function formatDuration(start: string, end: string | null): string {
    if (!end) return 'em andamento';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const m  = Math.floor(ms / 60000);
    const h  = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

const STATUS_FILTERS: { key: RoomHistory['status'] | 'ALL'; label: string }[] = [
    { key: 'ALL',     label: 'Todos'   },
    { key: 'OFFLINE', label: 'Offline' },
    { key: 'CRASHED', label: 'Crashados' },
    { key: 'ONLINE',  label: 'Online'  },
];

export default function HistoryPage() {
    const [history, setHistory] = useState<RoomHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter,  setFilter]  = useState<RoomHistory['status'] | 'ALL'>('ALL');

    useEffect(() => {
        new HistoryRepository().findRecent(50)
            .then(setHistory)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? history : history.filter(h => h.status === filter);

    const crashCount = history.filter(h => h.status === 'CRASHED').length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Histórico"
                description={`Últimas ${history.length} salas encerradas`}
                badge={crashCount > 0 ? { label: `${crashCount} crash${crashCount > 1 ? 'es' : ''}`, color: 'text-red-400 border-red-500/30 bg-red-500/10' } : undefined}
            />

            {/* Filters */}
            <div className="flex gap-1.5 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            filter === f.key
                                ? 'bg-primary/20 text-primary-light border border-primary/30'
                                : 'bg-surface2 text-gray-500 border border-border/60 hover:text-gray-300 hover:border-border'
                        }`}
                    >
                        {f.label}
                        <span className="ml-1.5 text-[10px] opacity-60">
                            {f.key === 'ALL' ? history.length : history.filter(h => h.status === f.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card"
            >
                {loading ? (
                    <div className="space-y-px p-2">
                        {[0,1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="skeleton h-3.5 w-48 rounded-lg" />
                                    <div className="skeleton h-2.5 w-28 rounded-lg" />
                                </div>
                                <div className="skeleton w-16 h-5 rounded-full" />
                                <div className="skeleton w-20 h-3 rounded-lg hidden md:block" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>}
                        title="Nenhum histórico encontrado"
                        description="Quando salas forem encerradas, elas aparecerão aqui."
                    />
                ) : (
                    <>
                        {/* Header row */}
                        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
                            <div className="w-9 shrink-0" />
                            <span className="flex-1">Sala</span>
                            <span className="w-24 text-center hidden md:block">Status</span>
                            <span className="w-28 hidden lg:block">Início</span>
                            <span className="w-20 text-center hidden lg:block">Duração</span>
                            <span className="w-14 text-right">Players</span>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {filtered.map((h, i) => {
                                const cfg = statusConfig[h.status];
                                return (
                                    <motion.div
                                        key={h.id}
                                        layout
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-0 hover:bg-surface2/30 transition-colors"
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                                            h.status === 'CRASHED' ? 'bg-red-500/10 border border-red-500/20' :
                                            h.status === 'OFFLINE' ? 'bg-surface3 border border-border/60' :
                                            'bg-emerald-500/10 border border-emerald-500/20'
                                        }`}>
                                            {cfg.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{h.roomName}</p>
                                            <p className="text-xs text-gray-600 font-mono truncate">{h.scriptName}.js</p>
                                        </div>

                                        <div className="hidden md:block w-24 text-center">
                                            <Badge color={cfg.color} dot>{cfg.label}</Badge>
                                        </div>

                                        <span className="hidden lg:block text-xs text-gray-500 w-28">
                                            {new Date(h.startedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </span>

                                        <span className="hidden lg:block text-xs text-gray-500 w-20 text-center font-mono">
                                            {formatDuration(h.startedAt, h.finishedAt)}
                                        </span>

                                        <div className="w-14 text-right">
                                            <span className="text-sm font-bold text-white">{h.playerCount}</span>
                                            <span className="text-[10px] text-gray-600 block">players</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>
        </div>
    );
}
