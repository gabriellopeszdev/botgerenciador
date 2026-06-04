'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader }    from '@/components/ui/PageHeader';
import { EmptyState }    from '@/components/ui/EmptyState';
import { ConfirmModal }  from '@/components/ui/ConfirmModal';
import { useAuth }  from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { BotRepository, type BotFull } from '@/core/repositories/BotRepository';
import { UserRepository, type PanelUser } from '@/core/repositories/UserRepository';
import { BotEditorModal } from '@/components/bots/BotEditorModal';

function BotRow({ bot, ownerName, onEdit, onToggle, onDelete }: {
    bot: BotFull;
    ownerName: string | null;
    onEdit:   () => void;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-surface2/40 transition-colors group"
            >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bot.active ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-surface3 border border-border/60'}`}>
                    <svg className={`w-4 h-4 ${bot.active ? 'text-emerald-400' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{bot.displayName}</span>
                        <span className="font-mono text-[10px] text-gray-600 truncate">({bot.scriptName})</span>
                    </div>
                    {bot.description && (
                        <p className="text-xs text-gray-600 truncate mt-0.5">{bot.description}</p>
                    )}
                </div>

                {/* Status */}
                <Badge color={bot.active ? 'green' : 'gray'} dot>
                    {bot.active ? 'Ativo' : 'Inativo'}
                </Badge>

                {/* Owner */}
                <div className="hidden md:flex items-center gap-1.5 shrink-0 w-28">
                    {ownerName ? (
                        <>
                            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary-light shrink-0">
                                {ownerName.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-500 truncate">{ownerName}</span>
                        </>
                    ) : (
                        <span className="text-xs text-gray-600">—</span>
                    )}
                </div>

                {/* Size + updated */}
                <div className="hidden lg:flex flex-col items-end shrink-0 w-24">
                    <span className="text-xs text-gray-500">{(bot.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span className="text-[10px] text-gray-600 mt-0.5">
                        {new Date(bot.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="xs" onClick={onEdit}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </Button>
                    <Button variant={bot.active ? 'warning' : 'success'} size="xs" onClick={onToggle}>
                        {bot.active ? (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                    </Button>
                    <Button variant="danger" size="xs" onClick={() => setConfirmDelete(true)}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        </svg>
                    </Button>
                </div>
            </motion.div>

            <ConfirmModal
                open={confirmDelete}
                title={`Excluir "${bot.scriptName}"?`}
                description="Esta ação remove o script do banco permanentemente. Salas em execução não são afetadas, mas não poderão ser reabertas com este bot."
                confirmLabel="Excluir"
                danger
                loading={deleting}
                onConfirm={async () => { setDeleting(true); await onDelete(); setDeleting(false); setConfirmDelete(false); }}
                onCancel={() => setConfirmDelete(false)}
            />
        </>
    );
}

export default function BotsPage() {
    const { isAdmin } = useAuth();
    const toast = useToast();
    const [bots,    setBots]    = useState<BotFull[]>([]);
    const [users,   setUsers]   = useState<PanelUser[]>([]);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<{ scriptName: string | null } | null>(null);
    const repo     = new BotRepository();
    const userRepo = new UserRepository();

    async function reload() {
        setLoading(true);
        try {
            const [bs, us] = await Promise.all([repo.findAll(), userRepo.listAll()]);
            setBots(bs); setUsers(us);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Erro ao carregar bots');
        } finally { setLoading(false); }
    }

    const userById = (id: string | null | undefined) =>
        id ? users.find(u => u.id === id)?.username ?? `${id.slice(0, 6)}…` : null;

    useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

    if (!isAdmin) return <div className="text-center py-12 text-sm text-gray-500">Apenas administradores.</div>;

    async function handleToggle(b: BotFull) {
        try {
            await repo.setActive(b.scriptName, !b.active);
            toast.success(`Bot "${b.displayName}" ${!b.active ? 'ativado' : 'desativado'}.`);
            await reload();
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro'); }
    }

    const filtered = bots.filter(b => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return b.scriptName.toLowerCase().includes(q) || b.displayName.toLowerCase().includes(q);
    });

    const activeCount = bots.filter(b => b.active).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bots"
                description={`${bots.length} script${bots.length !== 1 ? 's' : ''} cadastrado${bots.length !== 1 ? 's' : ''} · ${activeCount} ativo${activeCount !== 1 ? 's' : ''}`}
                action={
                    <Button onClick={() => setEditing({ scriptName: null })}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        Novo bot
                    </Button>
                }
            />

            {/* Search */}
            <div className="relative w-full md:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por script ou nome…" className="pl-9 w-full text-xs" />
            </div>

            {/* List */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card">
                {loading ? (
                    <div className="space-y-px p-2">
                        {[0,1,2].map(i => (
                            <div key={i} className="flex items-center gap-4 px-4 py-4">
                                <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="skeleton h-3.5 w-40 rounded-lg" />
                                    <div className="skeleton h-2.5 w-24 rounded-lg" />
                                </div>
                                <div className="skeleton w-16 h-5 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                        title={bots.length === 0 ? 'Nenhum bot cadastrado' : 'Nenhum bot corresponde à busca'}
                        description='Clique em "Novo bot" para adicionar um script de sala.'
                        action={bots.length === 0 ? <Button size="sm" onClick={() => setEditing({ scriptName: null })}>Novo bot</Button> : undefined}
                    />
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filtered.map(b => (
                            <BotRow
                                key={b.scriptName}
                                bot={b}
                                ownerName={userById(b.ownerId)}
                                onEdit={() => setEditing({ scriptName: b.scriptName })}
                                onToggle={() => handleToggle(b)}
                                onDelete={async () => { await repo.remove(b.scriptName); toast.success(`Bot "${b.scriptName}" excluído.`); await reload(); }}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            <BotEditorModal
                open={editing !== null}
                scriptName={editing?.scriptName ?? null}
                onClose={() => setEditing(null)}
                onSaved={reload}
            />
        </div>
    );
}
