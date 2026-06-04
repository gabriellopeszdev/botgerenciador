'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge }        from '@/components/ui/Badge';
import { Button }       from '@/components/ui/Button';
import { Modal }        from '@/components/ui/Modal';
import { PageHeader }   from '@/components/ui/PageHeader';
import { EmptyState }   from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { UserRepository, type PanelUser } from '@/core/repositories/UserRepository';
import { useAuth }  from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

function Avatar({ name, role }: { name: string; role: Role }) {
    const colors =
        role === 'SUPER_ADMIN' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
        : role === 'ADMIN'    ? 'bg-primary/20 border-primary/30 text-primary-light'
        :                       'bg-surface3 border-border text-gray-400';
    return (
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 ${colors}`}>
            {name.slice(0, 2).toUpperCase()}
        </div>
    );
}

function UserRow({ u, isSelf, canDelete, onRemove }: { u: PanelUser; isSelf: boolean; canDelete: boolean; onRemove: () => Promise<void> }) {
    const [confirm,  setConfirm]  = useState(false);
    const [removing, setRemoving] = useState(false);

    const badgeColor = u.role === 'SUPER_ADMIN' ? 'yellow' : u.role === 'ADMIN' ? 'blue' : 'gray';
    const roleLabel  = u.role === 'SUPER_ADMIN' ? '👑 Super Admin' : u.role;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-surface2/40 transition-colors group"
            >
                <Avatar name={u.username} role={u.role as Role} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{u.username}</span>
                        {isSelf && <span className="text-[10px] bg-primary/15 text-primary-light border border-primary/25 px-1.5 py-0.5 rounded-full font-semibold">você</span>}
                    </div>
                    <span className="text-xs text-gray-600">
                        Criado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                </div>

                <Badge color={badgeColor} dot>
                    {roleLabel}
                </Badge>

                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isSelf && canDelete && (
                        <Button variant="danger" size="xs" onClick={() => setConfirm(true)}>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            </svg>
                        </Button>
                    )}
                </div>
            </motion.div>

            <ConfirmModal
                open={confirm}
                title={`Remover "${u.username}"?`}
                description="Este usuário perderá acesso imediatamente e não poderá mais fazer login no painel."
                confirmLabel="Remover"
                danger
                loading={removing}
                onConfirm={async () => { setRemoving(true); await onRemove(); setRemoving(false); setConfirm(false); }}
                onCancel={() => setConfirm(false)}
            />
        </>
    );
}

function NewUserModal({ open, onClose, onCreate, isSuperAdmin }: {
    open: boolean; onClose: () => void; isSuperAdmin: boolean;
    onCreate: (username: string, password: string, role: Role) => Promise<void>;
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role,     setRole]     = useState<Role>('USER');
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState<string | null>(null);

    const availableRoles: Role[] = isSuperAdmin ? ['USER', 'ADMIN', 'SUPER_ADMIN'] : ['USER', 'ADMIN'];

    const roleConfig: Record<Role, { label: string; active: string; desc: string }> = {
        USER:        { label: '👤 Usuário',    active: 'bg-surface3 border-border text-white',                    desc: 'Acesso limitado: salas, meus bots e tokens.' },
        ADMIN:       { label: '⚡ Admin',      active: 'bg-primary/15 border-primary/40 text-primary-light',      desc: 'Acesso total: bots, tokens, usuários e servidor.' },
        SUPER_ADMIN: { label: '👑 Super Admin',active: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',  desc: 'Controle total. Não pode ser removido por admins.' },
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        setLoading(true); setError(null);
        try {
            await onCreate(username.trim(), password, role);
            setUsername(''); setPassword(''); setRole('USER');
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao criar usuário');
        } finally { setLoading(false); }
    }

    return (
        <Modal open={open} onClose={onClose} title="Novo usuário">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="new-username">Usuário</label>
                    <input id="new-username" type="text" value={username}
                        onChange={e => setUsername(e.target.value)} autoFocus required className="w-full" placeholder="nome do usuário" />
                </div>
                <div>
                    <label htmlFor="new-password">Senha</label>
                    <input id="new-password" type="password" value={password}
                        onChange={e => setPassword(e.target.value)} required minLength={4} className="w-full" placeholder="mínimo 4 caracteres" />
                </div>
                <div>
                    <label>Nível de acesso</label>
                    <div className="flex gap-2 mt-1">
                        {availableRoles.map(r => (
                            <button
                                key={r} type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                    role === r
                                        ? roleConfig[r].active
                                        : 'bg-surface2 border-border/60 text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {roleConfig[r].label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">{roleConfig[role].desc}</p>
                </div>
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-300">{error}</div>
                )}
                <div className="flex gap-2 pt-2">
                    <Button type="button" variant="ghost" className="flex-1 justify-center" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading} className="flex-1 justify-center">Criar usuário</Button>
                </div>
            </form>
        </Modal>
    );
}

export default function UsersPage() {
    const { isAdmin, isSuperAdmin, user: current } = useAuth();
    const toast = useToast();
    const [users,   setUsers]   = useState<PanelUser[]>([]);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [open,    setOpen]    = useState(false);
    const repo = new UserRepository();

    async function reload() {
        setLoading(true);
        try { setUsers(await repo.listAll()); }
        catch (e) { toast.error(e instanceof Error ? e.message : 'Erro ao carregar'); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

    if (!isAdmin) return <div className="text-center py-12 text-sm text-gray-500">Apenas administradores.</div>;

    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;
    const admins      = users.filter(u => u.role === 'ADMIN').length;
    const desc        = [
        `${users.length} usuário${users.length !== 1 ? 's' : ''}`,
        admins      > 0 ? `${admins} admin${admins !== 1 ? 's' : ''}`            : null,
        superAdmins > 0 ? `${superAdmins} super admin${superAdmins !== 1 ? 's' : ''}` : null,
    ].filter(Boolean).join(' · ');

    const filtered = users.filter(u =>
        !search.trim() || u.username.toLowerCase().includes(search.toLowerCase())
    );

    function canDelete(u: PanelUser): boolean {
        if (u.role === 'SUPER_ADMIN') return false;          // ninguém pode remover super admin
        if (u.role === 'ADMIN') return !!isSuperAdmin;       // só super admin pode remover admin
        return true;                                          // admin pode remover user
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Usuários"
                description={desc}
                action={
                    <Button onClick={() => setOpen(true)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        Novo usuário
                    </Button>
                }
            />

            {/* Search */}
            <div className="relative w-full md:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário…" className="pl-9 w-full text-xs" />
            </div>

            {/* List */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card">
                {loading ? (
                    <div className="space-y-px p-2">
                        {[0,1,2].map(i => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="skeleton h-3.5 w-32 rounded-lg" />
                                    <div className="skeleton h-2.5 w-24 rounded-lg" />
                                </div>
                                <div className="skeleton w-16 h-5 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20c0-3 2.7-6 6-6h4M16 14c2.2 0 4 1.8 4 4v2h-8v-2c0-2.2 1.8-4 4-4z"/></svg>}
                        title="Nenhum usuário encontrado"
                        description="Crie o primeiro usuário com o botão acima."
                        action={<Button size="sm" onClick={() => setOpen(true)}>Novo usuário</Button>}
                    />
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filtered.map(u => (
                            <UserRow
                                key={u.id}
                                u={u}
                                isSelf={u.id === current?.id}
                                canDelete={canDelete(u)}
                                onRemove={async () => {
                                    await repo.remove(u.id);
                                    toast.success(`Usuário "${u.username}" removido.`);
                                    await reload();
                                }}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            <NewUserModal
                open={open}
                onClose={() => setOpen(false)}
                isSuperAdmin={!!isSuperAdmin}
                onCreate={async (username, password, role) => {
                    await repo.create(username, password, role);
                    await reload();
                }}
            />
        </div>
    );
}
