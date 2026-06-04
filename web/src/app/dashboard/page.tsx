'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button }       from '@/components/ui/Button';
import { MetricsBar }   from '@/components/metrics/MetricsBar';
import { MetricsChart } from '@/components/metrics/MetricsChart';
import { RoomList }     from '@/components/rooms/RoomList';
import { OpenRoomModal } from '@/components/rooms/OpenRoomModal';
import { useLogs }      from '@/hooks/useLogs';
import { LogViewer }    from '@/components/cmpLogs/LogViewer';
import { useAuth }      from '@/contexts/AuthContext';
import { useRoomsContext } from '@/contexts/RoomsContext';

function PageHeader({ onOpenRoom }: { onOpenRoom: () => void }) {
    const { rooms } = useRoomsContext();
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4"
        >
            <div>
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-[3px] h-6 rounded-full bg-primary" />
                    <h1 className="text-2xl font-black text-white tracking-tight">Visão Geral</h1>
                </div>
                <p className="text-sm text-gray-500 ml-3">
                    {greeting} — {rooms.length > 0
                        ? <span><span className="text-emerald-400 font-semibold">{rooms.length}</span> sala{rooms.length !== 1 ? 's' : ''} ativa{rooms.length !== 1 ? 's' : ''}</span>
                        : 'nenhuma sala ativa no momento'}
                </p>
            </div>
            <Button onClick={onOpenRoom} size="md" className="shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Abrir sala
            </Button>
        </motion.div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            <div className="w-[3px] h-4 rounded-full bg-primary/70" />
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.18em]">{children}</h2>
        </div>
    );
}

export default function DashboardPage() {
    const [openModal, setOpenModal] = useState(false);
    const { logs, isLoading }       = useLogs();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace('/dashboard/rooms');
    }, [authLoading, isAdmin, router]);

    if (authLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader onOpenRoom={() => setOpenModal(true)} />

            {/* Métricas */}
            <section>
                <SectionTitle>Métricas do servidor</SectionTitle>
                <MetricsBar />
            </section>

            {/* Charts */}
            <section>
                <SectionTitle>Performance</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <MetricsChart metric="cpuPercent" title="CPU" color="#818cf8" unit="%" />
                    <MetricsChart metric="ramMb"      title="Memória RAM" color="#34d399" unit=" MB" />
                </div>
            </section>

            {/* Salas */}
            <section>
                <SectionTitle>Salas online</SectionTitle>
                <RoomList />
            </section>

            {/* Logs */}
            <section>
                <SectionTitle>Eventos recentes</SectionTitle>
                <div className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card">
                    <LogViewer logs={logs} isLoading={isLoading} showRoom />
                </div>
            </section>

            <OpenRoomModal open={openModal} onClose={() => setOpenModal(false)} />
        </div>
    );
}
