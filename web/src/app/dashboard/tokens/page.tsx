'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { TokenTable }       from '@/components/tokens/TokenTable';
import { AddTokenModal }    from '@/components/tokens/AddTokenModal';
import { AutoGenerateModal } from '@/components/tokens/AutoGenerateModal';
import { useTokens } from '@/hooks/useTokens';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { UserRepository, type PanelUser } from '@/core/repositories/UserRepository';
import type { TokenItem } from '@/types/api';

const STATUS_FILTERS: { key: TokenItem['status'] | 'ALL'; label: string }[] = [
    { key: 'ALL',         label: 'Todos'       },
    { key: 'AVAILABLE',   label: 'Disponíveis' },
    { key: 'IN_USE',      label: 'Em uso'      },
    { key: 'EXPIRED',     label: 'Expirados'   },
    { key: 'RATE_LIMITED',label: 'Rate Limited'},
];

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color} text-xs`}>
            <span className="font-bold text-white text-sm">{value}</span>
            <span className="text-gray-400">{label}</span>
        </div>
    );
}

export default function TokensPage() {
    const { tokens, isLoading, error, register, remove, autoGenerate } = useTokens();
    const { isAdmin } = useAuth();
    const toast = useToast();
    const [addOpen,  setAddOpen]  = useState(false);
    const [autoOpen, setAutoOpen] = useState(false);
    const [search,   setSearch]   = useState('');
    const [statusFilter, setStatusFilter] = useState<TokenItem['status'] | 'ALL'>('ALL');
    const [users, setUsers] = useState<PanelUser[]>([]);

    useEffect(() => {
        if (isAdmin) new UserRepository().listAll().then(setUsers).catch(() => setUsers([]));
    }, [isAdmin]);

    const usernameById = (id: string | null | undefined) =>
        id ? users.find(u => u.id === id)?.username ?? `${id.slice(0, 6)}…` : null;

    async function handleRemove(id: string) {
        try {
            await remove(id);
            toast.success('Token removido com sucesso.');
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro ao remover'); }
    }

    const stats = {
        available:   tokens.filter(t => t.status === 'AVAILABLE').length,
        inUse:       tokens.filter(t => t.status === 'IN_USE').length,
        expired:     tokens.filter(t => t.status === 'EXPIRED').length,
        rateLimit:   tokens.filter(t => t.status === 'RATE_LIMITED').length,
    };

    const filtered = tokens.filter(t => {
        if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return t.valueMasked.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tokens"
                description={`${tokens.length} token${tokens.length !== 1 ? 's' : ''} cadastrado${tokens.length !== 1 ? 's' : ''}`}
                action={isAdmin ? (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setAutoOpen(true)}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 8v4l3 3"/>
                            </svg>
                            Auto-gerar
                        </Button>
                        <Button onClick={() => setAddOpen(true)}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Adicionar
                        </Button>
                    </div>
                ) : undefined}
            />

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
            >
                <StatPill value={stats.available} label="disponíveis" color="border-emerald-500/20 bg-emerald-500/5" />
                <StatPill value={stats.inUse}     label="em uso"      color="border-primary/20 bg-primary/5"         />
                <StatPill value={stats.expired}   label="expirados"   color="border-red-500/20 bg-red-500/5"         />
                {stats.rateLimit > 0 && (
                    <StatPill value={stats.rateLimit} label="rate limited" color="border-amber-500/20 bg-amber-500/5" />
                )}
            </motion.div>

            {/* Filters + Search */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                statusFilter === f.key
                                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                                    : 'bg-surface2 text-gray-500 border border-border/60 hover:text-gray-300 hover:border-border'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="relative sm:ml-auto">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar token…"
                        className="pl-9 w-full sm:w-60 text-xs"
                    />
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-2 text-xs text-red-300">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/></svg>
                    {error}
                </div>
            )}

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card"
            >
                {isLoading ? (
                    <div className="space-y-px p-2">
                        {[0,1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl">
                                <div className="skeleton w-2 h-2 rounded-full" />
                                <div className="skeleton flex-1 h-3.5 rounded-lg" />
                                <div className="skeleton w-20 h-5 rounded-full" />
                                <div className="skeleton w-16 h-3 rounded-lg hidden md:block" />
                                <div className="skeleton w-28 h-3 rounded-lg hidden lg:block" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <TokenTable tokens={filtered} onRemove={handleRemove} usernameById={usernameById} />
                )}
            </motion.div>

            <AddTokenModal   open={addOpen}  onClose={() => setAddOpen(false)}  onSubmit={register} />
            <AutoGenerateModal open={autoOpen} onClose={() => setAutoOpen(false)} onSubmit={autoGenerate} users={users} />
        </div>
    );
}
