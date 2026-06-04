'use client';
import { useEffect, useState } from 'react';
import { Card }   from '@/components/ui/Card';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { BotRepository, type BotFull } from '@/core/repositories/BotRepository';
import { MyBotEditorModal } from '@/components/bots/MyBotEditorModal';

export default function MyBotsPage() {
    const toast = useToast();
    const [bots, setBots] = useState<BotFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
    const [search,  setSearch]  = useState('');
    const repo = new BotRepository();

    async function reload() {
        setLoading(true);
        try {
            setBots(await repo.findMine());
            setError(null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao carregar bots';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { reload(); }, []);

    const filtered = bots.filter(b => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return b.scriptName.toLowerCase().includes(q) || b.displayName.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold">Meus Bots</h1>
                <p className="text-xs text-gray-500 mt-1">
                    Bots atrelados à sua conta. Você pode editar nome de exibição, descrição e conteúdo do script.
                </p>
            </div>

            <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por script ou display…"
                className="w-full md:w-72"
            />

            {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">{error}</div>
            )}

            <Card noPadding>
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Carregando…</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        {bots.length === 0
                            ? 'Você ainda não tem bots atrelados. Peça a um administrador.'
                            : 'Nenhum bot corresponde à busca.'}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-border">
                                <th className="px-5 py-3 font-semibold">Script</th>
                                <th className="px-5 py-3 font-semibold">Display</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Tamanho</th>
                                <th className="px-5 py-3 font-semibold">Atualizado</th>
                                <th className="px-5 py-3 font-semibold w-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(b => (
                                <tr key={b.scriptName} className="border-b border-border last:border-0">
                                    <td className="px-5 py-3 font-mono text-xs">{b.scriptName}</td>
                                    <td className="px-5 py-3">{b.displayName}</td>
                                    <td className="px-5 py-3">
                                        <Badge color={b.active ? 'green' : 'gray'}>{b.active ? 'ATIVO' : 'INATIVO'}</Badge>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-400">
                                        {(b.sizeBytes / 1024).toFixed(1)} KB
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-400">
                                        {new Date(b.updatedAt).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setEditing(b.scriptName)}>
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <MyBotEditorModal
                open={editing !== null}
                scriptName={editing}
                onClose={() => setEditing(null)}
                onSaved={reload}
            />
        </div>
    );
}
