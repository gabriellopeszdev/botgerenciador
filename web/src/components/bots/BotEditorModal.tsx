'use client';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BotRepository } from '@/core/repositories/BotRepository';
import { UserRepository, type PanelUser } from '@/core/repositories/UserRepository';
import { useToast } from '@/contexts/ToastContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Props {
    open:       boolean;
    scriptName: string | null;  // null = criar; string = editar
    onClose:    () => void;
    onSaved:    () => void;
}

export function BotEditorModal({ open, scriptName, onClose, onSaved }: Props) {
    const repo = useRef(new BotRepository()).current;
    const userRepo = useRef(new UserRepository()).current;
    const toast = useToast();
    const isEdit = scriptName !== null;
    const [dragging, setDragging] = useState(false);
    const [users,    setUsers]    = useState<PanelUser[]>([]);
    const [ownerId,  setOwnerId]  = useState<string>('');

    const [name,        setName]        = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [content,     setContent]     = useState('');
    const [active,      setActive]      = useState(true);
    const [loading,     setLoading]     = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error,       setError]       = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
        userRepo.listAll().then(setUsers).catch(() => setUsers([]));
        if (isEdit && scriptName) {
            setLoadingData(true);
            repo.findSource(scriptName)
                .then(b => {
                    setName(b.scriptName);
                    setDisplayName(b.displayName);
                    setDescription(b.description ?? '');
                    setContent(b.scriptContent);
                    setActive(b.active);
                    setOwnerId(b.ownerId ?? '');
                })
                .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
                .finally(() => setLoadingData(false));
        } else {
            setName(''); setDisplayName(''); setDescription(''); setContent(''); setActive(true); setOwnerId('');
        }
    }, [open, scriptName]);

    async function loadFile(file: File) {
        if (!file.name.endsWith('.js')) {
            setError('Apenas arquivos .js são aceitos.');
            return;
        }
        const text = await file.text();
        setContent(text);
        if (!name) {
            const guess = file.name.replace(/\.js$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
            setName(guess);
        }
        setError(null);
    }

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        await loadFile(file);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(true);
    }
    function handleDragLeave(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
    }
    async function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await loadFile(file);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !displayName.trim() || !content.trim()) {
            setError('Preencha script, display e conteúdo.');
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            setError('Script deve conter apenas letras, números, _ ou -.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await repo.upsert({
                scriptName:    name.trim(),
                displayName:   displayName.trim(),
                description:   description.trim() || undefined,
                scriptContent: content,
                active,
                ownerId:       ownerId || null,
            });
            toast.success(`Bot "${name.trim()}" salvo.`);
            onSaved();
            onClose();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao salvar';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? `Editar bot: ${scriptName}` : 'Novo bot'} wide>
            {loadingData ? (
                <div className="text-center py-10 text-sm text-gray-500">Carregando…</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bot-name">Script (nome do arquivo)</label>
                            <input
                                id="bot-name"
                                type="text"
                                value={name}
                                disabled={isEdit}
                                onChange={e => setName(e.target.value)}
                                placeholder="arenaZK"
                                required
                                className="w-full font-mono text-xs"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Apenas a-z, 0-9, _ e -.</p>
                        </div>
                        <div>
                            <label htmlFor="bot-display">Display</label>
                            <input
                                id="bot-display"
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="⚫🟣ARENA .47🟣⚫"
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bot-desc">Descrição (opcional)</label>
                        <input
                            id="bot-desc"
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Sala principal — modo futebol, 40 jogadores"
                            className="w-full"
                        />
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={dragging ? 'ring-2 ring-primary/60 rounded-lg p-1 transition' : 'p-1'}
                    >
                        <label htmlFor="bot-file">Arquivo .js</label>
                        <input
                            id="bot-file"
                            type="file"
                            accept=".js,text/javascript"
                            onChange={handleFile}
                            className="w-full text-xs"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            {dragging
                                ? 'Solte o arquivo aqui…'
                                : 'Selecione, arraste-solte um .js ou edite abaixo.'}
                        </p>
                    </div>

                    <div>
                        <label>
                            Conteúdo do script ({(new Blob([content]).size / 1024).toFixed(1)} KB)
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <MonacoEditor
                                height="380px"
                                language="javascript"
                                theme="vs-dark"
                                value={content}
                                onChange={(v) => setContent(v ?? '')}
                                options={{
                                    fontSize:         12,
                                    minimap:          { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap:         'on',
                                    automaticLayout:  true,
                                    tabSize:          2,
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bot-owner">Dono (usuário do painel)</label>
                        <select
                            id="bot-owner"
                            value={ownerId}
                            onChange={e => setOwnerId(e.target.value)}
                            className="w-full"
                        >
                            <option value="">— sem dono (apenas admins editam) —</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.role})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            O dono pode editar este bot na página &quot;Meus Bots&quot;.
                        </p>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={e => setActive(e.target.checked)}
                            className="w-auto"
                        />
                        Ativo (aparece no seletor de bots ao abrir nova sala)
                    </label>

                    {error && (
                        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-400">{error}</div>
                    )}

                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" loading={loading}>Salvar</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
