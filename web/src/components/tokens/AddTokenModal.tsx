'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserRepository, type PanelUser } from '@/core/repositories/UserRepository';

interface Props {
    open:     boolean;
    onClose:  () => void;
    onSubmit: (value: string, ownerId: string | null) => Promise<void>;
}

export function AddTokenModal({ open, onClose, onSubmit }: Props) {
    const [value, setValue]     = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [users, setUsers]     = useState<PanelUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        new UserRepository().listAll().then(setUsers).catch(() => setUsers([]));
    }, [open]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!value.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await onSubmit(value.trim(), ownerId || null);
            setValue('');
            setOwnerId('');
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao registrar token');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Adicionar token">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="token-value">Token</label>
                    <input
                        id="token-value"
                        type="text"
                        autoFocus
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="thr1.AAA..."
                        required
                        className="w-full font-mono text-xs"
                    />
                </div>

                <div>
                    <label htmlFor="token-owner">Atrelar a (opcional)</label>
                    <select
                        id="token-owner"
                        value={ownerId}
                        onChange={e => setOwnerId(e.target.value)}
                        className="w-full"
                    >
                        <option value="">— sem dono (uso geral) —</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                        O dono pode ver e remover este token na página dele.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Adicionar</Button>
                </div>
            </form>
        </Modal>
    );
}
