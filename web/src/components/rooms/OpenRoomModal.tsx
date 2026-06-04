'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BotRepository }   from '@/core/repositories/BotRepository';
import { TokenRepository } from '@/core/repositories/TokenRepository';
import { RoomService }     from '@/core/services/RoomService';
import { RoomOpenProgress } from './RoomOpenProgress';
import { useRoomOpen } from '@/hooks/useRoomOpen';
import { useToast } from '@/contexts/ToastContext';
import type { BotItem, TokenItem } from '@/types/api';

interface Props { open: boolean; onClose: () => void; }

export function OpenRoomModal({ open, onClose }: Props) {
    const [bots,   setBots]   = useState<BotItem[]>([]);
    const [tokens, setTokens] = useState<TokenItem[]>([]);
    const [botFile,   setBotFile]   = useState('');
    const [tokenId,   setTokenId]   = useState('');
    const [channelId, setChannelId] = useState('');
    const [loading,     setLoading]     = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error,       setError]       = useState<string | null>(null);
    const [requestId,   setRequestId]   = useState<string | null>(null);
    const { isDone, update } = useRoomOpen(requestId);
    const toast = useToast();

    useEffect(() => {
        if (!open) return;
        setError(null);
        setRequestId(null);
        setBots([]);
        setTokens([]);
        setBotFile('');
        setTokenId('');
        setLoadingData(true);
        Promise.all([
            new BotRepository().findAllActive(),
            new TokenRepository().findAvailable(),
        ]).then(([bots, tokens]) => {
            setBots(bots);
            setTokens(tokens);
            if (bots.length   > 0) setBotFile(bots[0]!.scriptName);
            if (tokens.length > 0) setTokenId(tokens[0]!.id);
        }).catch(() => setError('Falha ao carregar bots/tokens')).finally(() => setLoadingData(false));
    }, [open]);

    useEffect(() => {
        if (!isDone || !requestId) return;
        if (update?.error) {
            toast.error(update.title || 'Erro ao abrir sala.');
        } else {
            toast.success('Sala aberta com sucesso.');
            const t = setTimeout(() => onClose(), 1500);
            return () => clearTimeout(t);
        }
    }, [isDone, requestId]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!tokenId || !botFile) return;
        setLoading(true);
        setError(null);
        try {
            const id = await RoomService.getInstance().open({
                botFile,
                tokenId,
                channelId: channelId.trim() || undefined,
            });
            setRequestId(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao abrir sala');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Abrir nova sala">
            <form onSubmit={handleSubmit} className="space-y-4">
                {loadingData && (
                    <p className="text-xs text-gray-400 text-center py-2">Carregando bots e tokens…</p>
                )}
                <div>
                    <label htmlFor="botFile">Bot</label>
                    <select
                        id="botFile"
                        value={botFile}
                        onChange={e => setBotFile(e.target.value)}
                        required
                        className="w-full"
                    >
                        {bots.length === 0 && <option value="">Nenhum bot disponível</option>}
                        {bots.map(b => (
                            <option key={b.scriptName} value={b.scriptName}>{b.displayName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="tokenId">Token</label>
                    <select
                        id="tokenId"
                        value={tokenId}
                        onChange={e => setTokenId(e.target.value)}
                        required
                        className="w-full"
                    >
                        {tokens.length === 0 && <option value="">Nenhum token disponível</option>}
                        {tokens.map(t => (
                            <option key={t.id} value={t.id}>{t.valueMasked}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="channelId">Canal Discord (opcional)</label>
                    <input
                        id="channelId"
                        type="text"
                        value={channelId}
                        onChange={e => setChannelId(e.target.value)}
                        placeholder="ID do canal (deixe vazio para padrão)"
                        className="w-full"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">
                        {error}
                    </div>
                )}

                <RoomOpenProgress requestId={requestId} />

                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button
                        type="submit"
                        loading={loading}
                        disabled={loadingData || bots.length === 0 || tokens.length === 0 || requestId !== null}
                    >
                        Abrir sala
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
