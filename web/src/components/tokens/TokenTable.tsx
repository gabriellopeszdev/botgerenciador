'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import type { TokenItem } from '@/types/api';

interface Props {
    tokens:        TokenItem[];
    onRemove:      (id: string) => Promise<void>;
    usernameById?: (id: string | null | undefined) => string | null;
}

const statusConfig: Record<TokenItem['status'], {
    color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
    dot: string;
    label: string;
}> = {
    AVAILABLE:    { color: 'green',  dot: 'bg-emerald-400', label: 'Disponível'   },
    IN_USE:       { color: 'blue',   dot: 'bg-primary-light', label: 'Em uso'     },
    EXPIRED:      { color: 'red',    dot: 'bg-red-400',     label: 'Expirado'     },
    RATE_LIMITED: { color: 'yellow', dot: 'bg-amber-400',   label: 'Rate Limited' },
};

function TokenRow({
    token, canRemove, username, onRemove,
}: {
    token: TokenItem;
    canRemove: boolean;
    username: string | null;
    onRemove: (id: string) => void;
}) {
    const cfg = statusConfig[token.status];
    const [confirm, setConfirm] = useState(false);
    const [removing, setRemoving] = useState(false);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0 }}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-surface2/40 transition-colors group"
            >
                {/* Status dot */}
                <div className="relative shrink-0">
                    <span className={`w-2 h-2 rounded-full block ${cfg.dot}`} />
                    {token.status === 'AVAILABLE' && (
                        <span className={`absolute inset-0 rounded-full ${cfg.dot} opacity-40 animate-ping`} />
                    )}
                </div>

                {/* Token value */}
                <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-gray-300 tracking-wide">{token.valueMasked}</span>
                </div>

                {/* Status badge */}
                <Badge color={cfg.color as any} dot>{cfg.label}</Badge>

                {/* Owner */}
                {username ? (
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary-light">
                            {username.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">{username}</span>
                    </div>
                ) : (
                    <span className="hidden md:block text-xs text-gray-600 shrink-0">Geral</span>
                )}

                {/* Last used */}
                <span className="hidden lg:block text-xs text-gray-600 shrink-0 w-36 text-right">
                    {token.lastUsedAt
                        ? new Date(token.lastUsedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : 'Nunca usado'}
                </span>

                {/* Actions */}
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canRemove && (
                        <Button variant="danger" size="xs" onClick={() => setConfirm(true)}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                        </Button>
                    )}
                </div>
            </motion.div>

            <ConfirmModal
                open={confirm}
                title="Remover token"
                description={`Tem certeza que deseja remover o token ${token.valueMasked}? Esta ação não pode ser desfeita.`}
                confirmLabel="Remover"
                danger
                loading={removing}
                onConfirm={async () => {
                    setRemoving(true);
                    await onRemove(token.id);
                    setRemoving(false);
                    setConfirm(false);
                }}
                onCancel={() => setConfirm(false)}
            />
        </>
    );
}

export function TokenTable({ tokens, onRemove, usernameById }: Props) {
    const { isAdmin, user } = useAuth();

    if (tokens.length === 0) {
        return (
            <EmptyState
                icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="15" r="4"/><path d="M12 15h8M16 11v8"/></svg>}
                title="Nenhum token encontrado"
                description="Adicione um token manualmente ou gere um automaticamente via Puppeteer."
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
                <div className="w-2 shrink-0" />
                <span className="flex-1">Token</span>
                <span className="w-24 text-center">Status</span>
                <span className="hidden md:block w-24">Dono</span>
                <span className="hidden lg:block w-36 text-right">Último uso</span>
                <span className="w-8" />
            </div>

            <AnimatePresence mode="popLayout">
                {tokens.map(t => (
                    <TokenRow
                        key={t.id}
                        token={t}
                        canRemove={isAdmin || t.ownerId === user?.id}
                        username={usernameById?.(t.ownerId) ?? null}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
