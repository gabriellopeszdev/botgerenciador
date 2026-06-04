'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MetricRepository } from '@/core/repositories/MetricRepository';
import { SocketManager } from '@/core/socket/SocketManager';
import type { CurrentMetrics, MetricPoint } from '@/types/api';

interface MetricsContextValue {
    current: CurrentMetrics | null;
    history: MetricPoint[];
}

const MetricsContext = createContext<MetricsContextValue | null>(null);

export function MetricsProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<CurrentMetrics | null>(null);
    const [history, setHistory] = useState<MetricPoint[]>([]);

    const repo   = new MetricRepository();
    const socket = SocketManager.getInstance();

    useEffect(() => {
        repo.getCurrent().then(setCurrent).catch(e => console.error('[MetricsContext] falha ao carregar métricas:', e));
        repo.getHistory(60).then(setHistory).catch(e => console.error('[MetricsContext] falha ao carregar histórico:', e));

        const unsub = socket.on('server:metrics', ({ cpu, ramMb, roomsOnline, timestamp }) => {
            setCurrent(prev => prev ? { ...prev, cpu, ramMb, roomsOnline } : { cpu, ramMb, roomsOnline, botUptime: 0 });
            setHistory(prev => {
                const point: MetricPoint = { cpuPercent: cpu, ramMb, roomsOnline, recordedAt: timestamp };
                return [...prev.slice(-59), point];
            });
        });

        return unsub;
    }, []);

    return (
        <MetricsContext.Provider value={{ current, history }}>
            {children}
        </MetricsContext.Provider>
    );
}

export function useMetricsContext(): MetricsContextValue {
    const ctx = useContext(MetricsContext);
    if (!ctx) throw new Error('useMetricsContext must be used within MetricsProvider');
    return ctx;
}
