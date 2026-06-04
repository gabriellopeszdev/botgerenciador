'use client';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BotRepository } from '@/core/repositories/BotRepository';
import { useToast } from '@/contexts/ToastContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Props {
    open:       boolean;
    scriptName: string | null;
    onClose:    () => void;
    onSaved:    () => void;
}

export function MyBotEditorModal({ open, scriptName, onClose, onSaved }: Props) {
    const repo = useRef(new BotRepository()).current;
    const toast = useToast();

    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [content,     setContent]     = useState('');
    const [loading,     setLoading]     = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error,       setError]       = useState<string | null>(null);
    const [dragging,    setDragging]    = useState(false);

    useEffect(() => {
        if (!open || !scriptName) return;
        setError(null);
        setLoadingData(true);
        repo.findSource(scriptName)
            .then(b => {
                setDisplayName(b.displayName);
                setDescription(b.description ?? '');
                setContent(b.scriptContent);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
            .finally(() => setLoadingData(false));
    }, [open, scriptName]);

    async function loadFile(file: File) {
        if (!file.name.endsWith('.js')) {
            setError('Apenas arquivos .js são aceitos.');
            return;
        }
        setContent(await file.text());
        setError(null);
    }
    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) await loadFile(file);
    }
    function handleDragOver(e: DragEvent<HTMLDivElement>)  { e.preventDefault(); setDragging(true); }
    function handleDragLeave(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setDragging(false); }
    async function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await loadFile(file);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!scriptName) return;
        if (!displayName.trim() || !content.trim()) {
            setError('Display e conteúdo são obrigatórios.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await repo.update(scriptName, {
                displayName:   displayName.trim(),
                description:   description.trim() || null,
                scriptContent: content,
            });
            toast.success(`Bot "${scriptName}" atualizado.`);
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
        <Modal open={open} onClose={onClose} title={`Editar bot: ${scriptName ?? ''}`} wide>
            {loadingData ? (
                <div className="text-center py-10 text-sm text-gray-500">Carregando…</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="my-display">Nome da sala (display)</label>
                        <input
                            id="my-display"
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            required
                            className="w-full"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            Aparece como nome in-game ao abrir a sala.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="my-desc">Descrição (opcional)</label>
                        <input
                            id="my-desc"
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={dragging ? 'ring-2 ring-primary/60 rounded-lg p-1 transition' : 'p-1'}
                    >
                        <label htmlFor="my-file">Substituir script (.js)</label>
                        <input
                            id="my-file"
                            type="file"
                            accept=".js,text/javascript"
                            onChange={handleFile}
                            className="w-full text-xs"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            {dragging ? 'Solte o arquivo aqui…' : 'Selecione, arraste-solte um .js ou edite abaixo.'}
                        </p>
                    </div>

                    <div>
                        <label>Conteúdo do script ({(new Blob([content]).size / 1024).toFixed(1)} KB)</label>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <MonacoEditor
                                height="380px"
                                language="javascript"
                                theme="vs-dark"
                                value={content}
                                onChange={(v) => setContent(v ?? '')}
                                options={{
                                    fontSize:             12,
                                    minimap:              { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap:             'on',
                                    automaticLayout:      true,
                                    tabSize:              2,
                                }}
                            />
                        </div>
                    </div>

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
