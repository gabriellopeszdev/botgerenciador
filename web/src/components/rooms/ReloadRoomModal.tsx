'use client';
import { useEffect, useState } from 'react';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TokenRepository } from '@/core/repositories/TokenRepository';
import { RoomService }     from '@/core/services/RoomService';
import { RoomOpenProgress } from './RoomOpenProgress';
import { useRoomOpen } from '@/hooks/useRoomOpen';
import { useToast }   from '@/contexts/ToastContext';
import type { TokenItem } from '@/types/api';

interface Props {
    open:   boolean;
    onClose: () => void;
    pageId: string;
    roomName: string;
    currentTokenMasked?: string;
}

export function ReloadRoomModal({ open, onClose, pageId, roomName, currentTokenMasked }: Props) {
    const [tokens,      setTokens]      = useState<TokenItem[]>([]);
    const [tokenId,     setTokenId]     = useState('');
    const [loadingData, setLoadingData] = useState(false);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState<string | null>(null);
    const [requestId,   setRequestId]   = useState<string | null>(null);
    const { isDone, update } = useRoomOpen(requestId);
    const toast = useToast();

    useEffect(() => {
        if (!open) return;
        setError(null);
        setRequestId(null);
        setTokenId('');
        setLoadingData(true);
        new TokenRepository().findAvailable()
            .then(t => setTokens(t))
            .catch(() => setError('Falha ao carregar tokens'))
            .finally(() => setLoadingData(false));
    }, [open]);

    useEffect(() => {
        if (!isDone || !requestId) return;
        if (update?.error) {
            toast.error(update.title || 'Erro ao reiniciar sala.');
        } else {
            toast.success(`Sala "${roomName}" reiniciada com sucesso.`);
            const t = setTimeout(() => onClose(), 1500);
            return () => clearTimeout(t);
        }
    }, [isDone, requestId]);

    async function handleSubmit() {
        setLoading(true);
        setError(null);
        try {
            const id = await RoomService.getInstance().reload(pageId, tokenId || undefined);
            setRequestId(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao reiniciar sala');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={`Reiniciar "${roomName}"`}>
            <div className="space-y-4">
                <p className="text-sm text-gray-400">
                    Escolha o token que será usado ao reiniciar a sala. Deixe em <span className="text-white font-medium">Token atual</span> para reutilizar o mesmo.
                </p>

                {loadingData && (
                    <p className="text-xs text-gray-400 text-center py-2">Carregando tokens…</p>
                )}

                <div>
                    <label htmlFor="reloadToken">Token</label>
                    <select
                        id="reloadToken"
                        value={tokenId}
                        onChange={e => setTokenId(e.target.value)}
                        className="w-full"
                        disabled={loadingData || requestId !== null}
                    >
                        <option value="">
                            Token atual{currentTokenMasked ? ` (${currentTokenMasked})` : ''}
                        </option>
                        {tokens.map(t => (
                            <option key={t.id} value={t.id}>{t.valueMasked}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">
                        {error}
                    </div>
                )}

                <RoomOpenProgress requestId={requestId} />

                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading || (requestId !== null && !isDone)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="warning"
                        loading={loading}
                        disabled={loadingData || requestId !== null}
                        onClick={handleSubmit}
                    >
                        Reiniciar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
