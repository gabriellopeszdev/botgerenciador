'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RoomService } from '@/core/services/RoomService';
import { ReloadRoomModal } from './ReloadRoomModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { RoomSnapshot } from '@/types/api';

interface Props { room: RoomSnapshot; }

function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className={`font-data text-lg font-semibold leading-none tabular-nums ${accent ?? 'text-white'}`}>
                {value}
            </span>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">{label}</span>
        </div>
    );
}

export function RoomCard({ room }: Props) {
    const service = RoomService.getInstance();
    const { isAdmin } = useAuth();
    const toast = useToast();
    const [reloadOpen, setReloadOpen] = useState(false);
    const [closing,   setClosing]   = useState(false);
    const [closing2,  setClosing2]  = useState(false);

    async function handleClose() {
        setClosing2(true);
        setTimeout(async () => {
            setClosing(true);
            try {
                await service.close(room.pageId);
                toast.success(`Sala "${room.name}" fechada.`);
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Erro ao fechar');
                setClosing(false);
            }
            setClosing2(false);
        }, 0);
    }

    const pingColor = room.avgPing == null ? 'text-gray-600'
        : room.avgPing < 80  ? 'text-emerald-400'
        : room.avgPing < 150 ? 'text-amber-400'
        : 'text-red-400';

    return (
        <>
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-surface border border-border/60 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 relative group"
        >
            {/* Left accent bar — color indicates status */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-400/70 group-hover:bg-emerald-400 transition-colors duration-300" />

            <div className="pl-5 pr-4 pt-4 pb-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-bold text-white truncate leading-tight tracking-tight">{room.name}</h3>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5 font-data">{room.botFile}.js</p>
                    </div>
                    <Badge color="green" dot>Online</Badge>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-5 mb-4 pl-0.5">
                    <Stat value={room.playerCount} label="Players" accent="text-primary-light" />
                    <div className="w-px h-8 bg-border/60" />
                    <Stat value={room.avgPing != null ? `${room.avgPing}ms` : '—'} label="Ping" accent={pingColor} />
                    <div className="w-px h-8 bg-border/60" />
                    <Stat value={formatUptime(room.uptimeSeconds)} label="Uptime" />
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-2">
                    {/^https?:\/\//.test(room.url) && (
                        <a
                            href={room.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-primary/8 hover:bg-primary/15 border border-primary/15 hover:border-primary/35 text-primary-light text-xs font-semibold transition-all duration-200"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                            Entrar
                        </a>
                    )}
                    <Link
                        href={`/dashboard/logs/${room.dbId}`}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-surface2 hover:bg-surface3 border border-border/60 hover:border-border text-gray-500 hover:text-gray-300 text-xs font-medium transition-all duration-200"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        </svg>
                        Logs
                    </Link>
                </div>

                {/* Admin actions */}
                <AnimatePresence>
                    {isAdmin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                            className="flex gap-2 pt-3 border-t border-border/40"
                        >
                            <Button variant="warning" size="sm" onClick={() => setReloadOpen(true)} className="flex-1 justify-center">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
                                </svg>
                                Reiniciar
                            </Button>
                            <Button variant="danger" size="sm" loading={closing} onClick={handleClose} className="flex-1 justify-center">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />
                                </svg>
                                Fechar
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>

        <ReloadRoomModal
            open={reloadOpen}
            onClose={() => setReloadOpen(false)}
            pageId={room.pageId}
            roomName={room.name}
        />
    </>
    );
}
