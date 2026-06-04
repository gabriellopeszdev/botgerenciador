'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion }        from 'framer-motion';
import { MetricsBar }    from '@/components/metrics/MetricsBar';
import { MetricsChart }  from '@/components/metrics/MetricsChart';
import { LogViewer }     from '@/components/cmpLogs/LogViewer';
import { Button }        from '@/components/ui/Button';
import { Modal }         from '@/components/ui/Modal';
import { useAuth }       from '@/contexts/AuthContext';
import { ApiClient }     from '@/core/http/ApiClient';
import { SocketManager } from '@/core/socket/SocketManager';
import type { RoomLog }  from '@/types/api';

const MAX_LOGS = 200;

function BroadcastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [msg,     setMsg]     = useState('');
    const [loading, setLoading] = useState(false);
    const [result,  setResult]  = useState<{ ok: boolean; text: string } | null>(null);

    async function handleSend() {
        if (!msg.trim()) return;
        setLoading(true); setResult(null);
        try {
            const data = await ApiClient.getInstance().post<{ ok: boolean; sent: number }>(
                '/api/rooms/broadcast', { message: msg.trim() }
            );
            setResult({ ok: true, text: `Mensagem enviada para ${data.sent} sala(s).` });
            setMsg('');
        } catch (e) {
            setResult({ ok: false, text: e instanceof Error ? e.message : 'Erro ao enviar.' });
        } finally { setLoading(false); }
    }

    function handleClose() { setMsg(''); setResult(null); onClose(); }

    return (
        <Modal open={open} onClose={handleClose} title="Broadcast Global">
            <div className="space-y-4">
                <p className="text-xs text-gray-500">
                    Envia um anúncio em amarelo para o chat de <strong className="text-gray-300">todas as salas ativas</strong>.
                </p>
                <textarea
                    value={msg}
                    onChange={e => setMsg(e.target.value.slice(0, 500))}
                    rows={3}
                    placeholder="Digite a mensagem…"
                    className="w-full resize-none text-sm"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(); }}
                />
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-700">{msg.length}/500 · Ctrl+Enter para enviar</span>
                    {result && (
                        <span className={`text-xs font-medium ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result.text}
                        </span>
                    )}
                </div>
                <div className="flex gap-2 pt-1">
                    <Button variant="ghost" className="flex-1 justify-center" onClick={handleClose}>Cancelar</Button>
                    <Button loading={loading} disabled={!msg.trim()} className="flex-1 justify-center" onClick={handleSend}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                        </svg>
                        Enviar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default function ServerPage() {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [logs,          setLogs]          = useState<(RoomLog & { roomId: string })[]>([]);
    const [logsLoading,   setLogsLoading]   = useState(true);
    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const socket = SocketManager.getInstance();

    useEffect(() => {
        if (!isLoading && !isAdmin) router.replace('/dashboard/rooms');
    }, [isLoading, isAdmin, router]);

    useEffect(() => {
        if (!isAdmin) return;
        ApiClient.getInstance().get<RoomLog[]>('/api/logs?limit=100')
            .then(ls => setLogs(ls.map(l => ({ ...l, roomId: '' }))))
            .catch(() => {})
            .finally(() => setLogsLoading(false));

        const unsub = socket.on('log:entry', (entry: RoomLog & { roomId: string }) => {
            setLogs(prev => [entry, ...prev].slice(0, MAX_LOGS));
        });
        return unsub;
    }, [isAdmin]);

    if (isLoading || !isAdmin) {
        return <div className="text-center py-12 text-sm text-gray-500">Redirecionando…</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 rounded-full bg-gradient-primary" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">Servidor</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-3">Métricas em tempo real e logs do sistema</p>
                </div>
                <Button onClick={() => setBroadcastOpen(true)} variant="ghost">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                    </svg>
                    Broadcast
                </Button>
            </div>

            <MetricsBar />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MetricsChart metric="cpuPercent" title="CPU"  color="#7c5cff" unit="%" />
                <MetricsChart metric="ramMb"      title="RAM"  color="#10b981" unit=" MB" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card"
            >
                <div className="px-5 py-3.5 border-b border-border/60">
                    <h2 className="text-sm font-semibold text-white">Logs do Sistema</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Últimos {MAX_LOGS} eventos de todas as salas</p>
                </div>
                <div className="p-3">
                    <LogViewer logs={logs} isLoading={logsLoading} showRoom />
                </div>
            </motion.div>

            <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
        </div>
    );
}
