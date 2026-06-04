'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomOpen } from '@/hooks/useRoomOpen';

interface Props { requestId: string | null; }

const steps = ['Iniciando', 'Carregando HaxBall', 'Injetando script', 'Sala online'];

export function RoomOpenProgress({ requestId }: Props) {
    const { update, isDone } = useRoomOpen(requestId);

    if (!requestId) return null;

    const currentStep = isDone ? 4
        : !update ? 0
        : update.title.toLowerCase().includes('inject') ? 2
        : update.title.toLowerCase().includes('carregando') ? 1
        : 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
            >
                <div className={`rounded-xl border p-4 space-y-3 ${update?.error ? 'bg-red-500/8 border-red-500/25' : 'bg-surface2/60 border-border/60'}`}>
                    {/* Steps */}
                    {!update?.error && (
                        <div className="flex items-center gap-1.5">
                            {steps.map((step, i) => {
                                const done    = i < currentStep;
                                const active  = i === currentStep && !isDone;
                                const success = isDone && i === steps.length - 1;
                                return (
                                    <div key={step} className="flex items-center gap-1.5 flex-1">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                success ? 'bg-emerald-500 border-0'
                                                : done   ? 'bg-primary border-0'
                                                : active ? 'border-2 border-primary/60 bg-primary/10'
                                                : 'border border-border bg-surface3'
                                            }`}>
                                                {done || success ? (
                                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                ) : active ? (
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                ) : null}
                                            </div>
                                            <span className={`text-[10px] hidden sm:block ${done || success ? 'text-gray-300' : active ? 'text-primary-light font-semibold' : 'text-gray-600'}`}>
                                                {step}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`flex-1 h-px transition-all duration-500 ${done ? 'bg-primary/50' : 'bg-border/60'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Status message */}
                    {!update && !isDone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                            </svg>
                            Aguardando resposta do servidor…
                        </div>
                    )}

                    {update && (
                        <div className="flex items-start gap-2">
                            {!isDone && !update.error && (
                                <svg className="w-3.5 h-3.5 animate-spin text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                                </svg>
                            )}
                            {isDone && (
                                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                            {update.error && (
                                <svg className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            )}
                            <div>
                                <p className={`text-xs font-semibold ${update.error ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-white'}`}>
                                    {update.title}
                                </p>
                                {update.description && (
                                    <p className="text-[11px] text-gray-500 mt-0.5 whitespace-pre-line">{update.description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
