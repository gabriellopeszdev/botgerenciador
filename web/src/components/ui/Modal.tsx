'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface ModalProps {
    open:     boolean;
    onClose:  () => void;
    title:    string;
    children: ReactNode;
    wide?:    boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div
                            className={clsx(
                                'relative bg-surface border border-border/80 rounded-2xl shadow-2xl w-full z-10',
                                'bg-gradient-card',
                                wide ? 'max-w-2xl' : 'max-w-md',
                            )}
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                                <h2 className="text-base font-semibold text-white">{title}</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-surface2 transition-colors"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                                    </svg>
                                </motion.button>
                            </div>
                            <div className="p-6">{children}</div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
