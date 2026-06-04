'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomsContext } from '@/contexts/RoomsContext';
import { RoomCard } from './RoomCard';

function SkeletonCard() {
    return (
        <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <div className="skeleton h-4 w-36 rounded-lg" />
                    <div className="skeleton h-3 w-24 rounded-lg" />
                </div>
                <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
            <div className="skeleton h-9 w-full rounded-xl" />
        </div>
    );
}

export function RoomList() {
    const { rooms, isLoading } = useRoomsContext();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[0,1,2].map(i => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 border border-dashed border-border/60 rounded-2xl bg-surface/30"
            >
                <div className="w-12 h-12 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-gray-400">Nenhuma sala online</p>
                <p className="text-xs text-gray-600 mt-1">Use o botão "Abrir nova sala" para criar uma.</p>
            </motion.div>
        );
    }

    return (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
                {rooms.map(room => <RoomCard key={room.pageId} room={room} />)}
            </AnimatePresence>
        </motion.div>
    );
}
