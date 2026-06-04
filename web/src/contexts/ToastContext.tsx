'use client';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast { id: number; message: string; variant: ToastVariant; }

interface ToastContextValue {
    toast:   (message: string, variant?: ToastVariant) => void;
    success: (message: string) => void;
    error:   (message: string) => void;
    info:    (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

const config: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.ReactElement }> = {
    success: {
        bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300',
        icon: <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>,
    },
    error: {
        bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300',
        icon: <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>,
    },
    info: {
        bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300',
        icon: <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>,
    },
    warning: {
        bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300',
        icon: <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
        const id = nextId++;
        setToasts(prev => [...prev.slice(-4), { id, message, variant }]);
        setTimeout(() => remove(id), 4500);
    }, [remove]);

    const value: ToastContextValue = {
        toast,
        success: m => toast(m, 'success'),
        error:   m => toast(m, 'error'),
        info:    m => toast(m, 'info'),
        warning: m => toast(m, 'warning'),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => {
                        const c = config[t.variant];
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                onClick={() => remove(t.id)}
                                className={clsx(
                                    'flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl cursor-pointer pointer-events-auto glass',
                                    c.bg, c.border,
                                )}
                            >
                                {c.icon}
                                <span className={clsx('text-xs leading-relaxed break-words flex-1', c.text)}>
                                    {t.message}
                                </span>
                                <button className="text-gray-600 hover:text-gray-400 ml-1 shrink-0">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
