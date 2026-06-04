'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { RoomRepository } from '@/core/repositories/RoomRepository';
import { SocketManager } from '@/core/socket/SocketManager';
import type { RoomSnapshot } from '@/types/api';

interface RoomsContextValue {
    rooms:     RoomSnapshot[];
    isLoading: boolean;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
    const [rooms, setRooms]         = useState<RoomSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const repo   = new RoomRepository();
    const socket = SocketManager.getInstance();

    useEffect(() => {
        repo.findAll()
            .then(setRooms)
            .catch(e => console.error('[RoomsContext] falha ao carregar salas:', e))
            .finally(() => setIsLoading(false));

        const unsubs = [
            socket.on('rooms:snapshot', rooms => {
                setRooms(rooms.map(r => ({ ...r, startedAt: new Date(r.startedAt) })));
                setIsLoading(false);
            }),
            socket.on('room:added', room => {
                setRooms(prev => {
                    const exists = prev.some(r => r.pageId === room.pageId);
                    const parsed = { ...room, startedAt: new Date(room.startedAt) };
                    return exists ? prev.map(r => r.pageId === room.pageId ? parsed : r) : [...prev, parsed];
                });
            }),
            socket.on('room:removed', ({ pageId }) => {
                setRooms(prev => prev.filter(r => r.pageId !== pageId));
            }),
            socket.on('room:metrics', ({ pageId, playerCount, avgPing }) => {
                setRooms(prev => prev.map(r =>
                    r.pageId === pageId ? { ...r, playerCount, avgPing } : r,
                ));
            }),
        ];

        return () => unsubs.forEach(fn => fn());
    }, []);

    return (
        <RoomsContext.Provider value={{ rooms, isLoading }}>
            {children}
        </RoomsContext.Provider>
    );
}

export function useRoomsContext(): RoomsContextValue {
    const ctx = useContext(RoomsContext);
    if (!ctx) throw new Error('useRoomsContext must be used within RoomsProvider');
    return ctx;
}
