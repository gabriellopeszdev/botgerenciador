'use client';
import { useEffect, useRef, useState } from 'react';
import { SocketManager } from '@/core/socket/SocketManager';
import { ApiClient }     from '@/core/http/ApiClient';
import type { RoomOpenUpdate } from '@/types/api';

const POLL_INTERVAL = 3_000; // 3s — fallback quando socket não entrega

/**
 * Acompanha o progresso de abertura de uma sala via socket room:open:update,
 * com fallback de polling HTTP para quando o evento socket é perdido.
 */
export function useRoomOpen(requestId: string | null) {
    const [update, setUpdate] = useState<RoomOpenUpdate | null>(null);
    const [isDone, setIsDone] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function applyUpdate(data: RoomOpenUpdate) {
        setUpdate(data);
        if (data.error || data.title.includes('Online') || data.title.includes('Erro') || data.title.includes('💥')) {
            setIsDone(true);
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
    }

    useEffect(() => {
        if (!requestId) return;

        setUpdate(null);
        setIsDone(false);

        const socket = SocketManager.getInstance();
        const unsub = socket.on('room:open:update', data => {
            if (data.requestId !== requestId) return;
            applyUpdate(data);
        });

        // Polling fallback: verifica a cada 3s se o socket não entregou o evento
        pollRef.current = setInterval(async () => {
            try {
                const res = await ApiClient.getInstance().get<{ ok: boolean; update?: RoomOpenUpdate }>(
                    `/api/rooms/open/status/${requestId}`
                );
                if (res.ok && res.update) applyUpdate(res.update);
            } catch { /* ignora erros de polling */ }
        }, POLL_INTERVAL);

        return () => {
            unsub();
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };
    }, [requestId]);

    return { update, isDone };
}
