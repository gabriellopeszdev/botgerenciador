'use client';
import { useState, type FormEvent } from 'react';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import type { PanelUser } from '@/core/repositories/UserRepository';

interface Props {
    open:     boolean;
    onClose:  () => void;
    onSubmit: (ownerId: string | null) => Promise<void>;
    users:    PanelUser[];
}

export function AutoGenerateModal({ open, onClose, onSubmit, users }: Props) {
    const [ownerId, setOwnerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus]   = useState<string | null>(null);
    const [error, setError]     = useState<string | null>(null);
    const toast = useToast();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus('Abrindo navegador e tentando passar o reCAPTCHA… (até 30 s)');
        try {
            await onSubmit(ownerId || null);
            toast.success('Token gerado e registrado com sucesso!');
            setOwnerId('');
            setStatus(null);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao gerar token');
            setStatus(null);
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (loading) return;
        setError(null);
        setStatus(null);
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose} title="Gerar token automaticamente">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-gray-400">
                    O servidor abrirá <span className="font-mono">haxball.com/headlesstoken</span> via Puppeteer
                    com stealth mode e tentará passar o reCAPTCHA automaticamente.
                    Pode levar até 30 segundos.
                </p>

                <div>
                    <label htmlFor="auto-token-owner">Atrelar a (opcional)</label>
                    <select
                        id="auto-token-owner"
                        value={ownerId}
                        onChange={e => setOwnerId(e.target.value)}
                        className="w-full"
                        disabled={loading}
                    >
                        <option value="">— sem dono (uso geral) —</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                    </select>
                </div>

                {status && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-center gap-2">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full" />
                        {status}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Gerar token</Button>
                </div>
            </form>
        </Modal>
    );
}
