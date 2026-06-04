'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RoomRepository } from '@/core/repositories/RoomRepository';
import { SocketManager } from '@/core/socket/SocketManager';
import type { RoomLog } from '@/types/api';

const MAX_LOGS = 200;

export function useLogs(dbId?: string) {
    const [logs, setLogs]           = useState<(RoomLog & { roomId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const repo   = useMemo(() => new RoomRepository(), []);
    const socket = SocketManager.getInstance();
    const dbIdRef = useRef(dbId);
    dbIdRef.current = dbId;

    useEffect(() => {
        if (dbId) {
            setIsLoading(true);
            repo.getLogs(dbId, 50)
                .then(ls => setLogs(ls.map(l => ({ ...l, roomId: dbId }))))
                .catch(() => {})
                .finally(() => setIsLoading(false));
        }

        const unsub = socket.on('log:entry', entry => {
            if (dbIdRef.current && entry.roomId !== dbIdRef.current) return;
            setLogs(prev => [entry, ...prev].slice(0, MAX_LOGS));
        });

        return unsub;
    }, [dbId]);

    return { logs, isLoading };
}
