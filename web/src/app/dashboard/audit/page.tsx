'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Badge }      from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth }    from '@/contexts/AuthContext';
import { ApiClient }  from '@/core/http/ApiClient';

interface AuditEntry {
    id:        string;
    action:    string;
    actorId:   string | null;
    actorName: string | null;
    targetId:  string | null;
    details:   string | null;
    ip:        string | null;
    createdAt: string;
}

// Mapeia ação → cor e label legível
const ACTION_META: Record<string, { color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'; label: string }> = {
    ROOM_OPEN:         { color: 'green',  label: 'Sala Aberta'        },
    ROOM_CLOSE:        { color: 'gray',   label: 'Sala Fechada'       },
    ROOM_RELOAD:       { color: 'blue',   label: 'Sala Recarregada'   },
    TOKEN_ADD:         { color: 'green',  label: 'Token Adicionado'   },
    TOKEN_DELETE:      { color: 'red',    label: 'Token Removido'     },
    TOKEN_OWNER_CHANGE:{ color: 'yellow', label: 'Dono de Token'      },
    BOT_UPSERT:        { color: 'blue',   label: 'Bot Editado'        },
    BOT_DELETE:        { color: 'red',    label: 'Bot Removido'       },
    BOT_OWNER_CHANGE:  { color: 'yellow', label: 'Dono de Bot'        },
    BOT_TOGGLE_ACTIVE: { color: 'purple', label: 'Bot Ativado/Pausado'},
    USER_CREATE:       { color: 'green',  label: 'Usuário Criado'     },
    USER_DELETE:       { color: 'red',    label: 'Usuário Removido'   },
    USER_LOGIN:        { color: 'blue',   label: 'Login'              },
    USER_LOGIN_FAIL:   { color: 'red',    label: 'Login Falhou'       },
};

function meta(action: string) {
    return ACTION_META[action] ?? { color: 'gray' as const, label: action };
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s    = Math.floor(diff / 1000);
    if (s < 60)   return `${s}s atrás`;
    const m = Math.floor(s / 60);
    if (m < 60)   return `${m}min atrás`;
    const h = Math.floor(m / 60);
    if (h < 24)   return `${h}h atrás`;
    return new Date(iso).toLocaleDateString('pt-BR');
}

export default function AuditPage() {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');
    const [filter,  setFilter]  = useState<string>('ALL');

    useEffect(() => {
        if (!isLoading && !isAdmin) router.replace('/dashboard/rooms');
    }, [isLoading, isAdmin, router]);

    useEffect(() => {
        if (!isAdmin) return;
        ApiClient.getInstance().get<AuditEntry[]>('/api/audit?limit=200')
            .then(setEntries)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isAdmin]);

    if (isLoading || !isAdmin) {
        return <div className="text-center py-12 text-sm text-gray-500">Redirecionando…</div>;
    }

    const actionTypes = ['ALL', ...Array.from(new Set(entries.map(e => e.action))).sort()];

    const filtered = entries.filter(e => {
        const matchFilter = filter === 'ALL' || e.action === filter;
        const q = search.trim().toLowerCase();
        const matchSearch = !q || [e.actorName, e.action, e.details, e.targetId, e.ip]
            .some(v => v?.toLowerCase().includes(q));
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Audit Log"
                description={`${entries.length} registros · últimas ações do sistema`}
            />

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar ator, ação, detalhes…"
                        className="pl-9 w-full text-xs"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'ROOM_OPEN', 'ROOM_CLOSE', 'BOT_UPSERT', 'BOT_DELETE', 'TOKEN_ADD', 'TOKEN_DELETE', 'USER_CREATE', 'USER_DELETE', 'USER_LOGIN', 'USER_LOGIN_FAIL'].map(key => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                                filter === key
                                    ? 'bg-primary/15 border-primary/40 text-primary-light'
                                    : 'bg-surface2 border-border/60 text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {key === 'ALL' ? 'Todos' : meta(key).label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabela */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-card"
            >
                {loading ? (
                    <div className="space-y-px p-2">
                        {[0,1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                                <div className="skeleton w-24 h-5 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="skeleton h-3 w-48 rounded" />
                                    <div className="skeleton h-2.5 w-32 rounded" />
                                </div>
                                <div className="skeleton w-16 h-3 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>}
                        title="Nenhum registro encontrado"
                        description="Tente ajustar o filtro ou a busca."
                    />
                ) : (
                    <div className="divide-y divide-border/50">
                        {filtered.map((e, i) => {
                            const { color, label } = meta(e.action);
                            return (
                                <motion.div
                                    key={e.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                    className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface2/40 transition-colors"
                                >
                                    <div className="pt-0.5 shrink-0">
                                        <Badge color={color} dot>{label}</Badge>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            {e.actorName ? (
                                                <span className="font-semibold text-white">{e.actorName}</span>
                                            ) : (
                                                <span className="text-gray-600 italic">sistema</span>
                                            )}
                                            {e.targetId && (
                                                <>
                                                    <span className="text-gray-600">→</span>
                                                    <span className="text-gray-400 font-mono text-xs truncate max-w-[160px]">{e.targetId}</span>
                                                </>
                                            )}
                                        </div>
                                        {e.details && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{e.details}</p>
                                        )}
                                        {e.ip && (
                                            <p className="text-[10px] text-gray-700 mt-0.5 font-mono">{e.ip}</p>
                                        )}
                                    </div>

                                    <span className="text-[11px] text-gray-600 shrink-0 pt-0.5" title={new Date(e.createdAt).toLocaleString('pt-BR')}>
                                        {timeAgo(e.createdAt)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
