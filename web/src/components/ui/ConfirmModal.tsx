'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface Props {
    open:        boolean;
    title:       string;
    description: string;
    confirmLabel?: string;
    danger?:     boolean;
    loading?:    boolean;
    onConfirm:   () => void;
    onCancel:    () => void;
}

export function ConfirmModal({ open, title, description, confirmLabel = 'Confirmar', danger = false, loading, onConfirm, onCancel }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />
                    <motion.div
                        className="relative bg-surface border border-border/80 rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6"
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
                            {danger ? (
                                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            )}
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-1">{title}</h3>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{description}</p>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button
                                variant={danger ? 'danger' : 'warning'}
                                className="flex-1 justify-center"
                                loading={loading}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
