'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { RoomList } from '@/components/rooms/RoomList';
import { OpenRoomModal } from '@/components/rooms/OpenRoomModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRoomsContext } from '@/contexts/RoomsContext';

export default function RoomsPage() {
    const [open, setOpen] = useState(false);
    const { isAdmin } = useAuth();
    const { rooms } = useRoomsContext();

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-5 rounded-full bg-gradient-primary" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">Salas</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-3">
                        {rooms.length > 0
                            ? <><span className="text-emerald-400 font-semibold">{rooms.length}</span> sala{rooms.length !== 1 ? 's' : ''} ativa{rooms.length !== 1 ? 's' : ''}</>
                            : 'Nenhuma sala ativa no momento'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setOpen(true)} size="md" className="shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Abrir sala
                    </Button>
                )}
            </motion.div>

            <RoomList />
            <OpenRoomModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
}
