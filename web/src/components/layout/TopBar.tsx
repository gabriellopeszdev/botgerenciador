'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth }          from '@/contexts/AuthContext';
import { useMetricsContext } from '@/contexts/MetricsContext';
import { Button }           from '@/components/ui/Button';
import { Modal }            from '@/components/ui/Modal';
import { ApiClient }        from '@/core/http/ApiClient';

function EyeIcon({ visible }: { visible: boolean }) {
    return visible ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function PasswordField({
    id, label, value, onChange, autoFocus, placeholder, autoComplete,
}: {
    id: string; label: string; value: string;
    onChange: (v: string) => void; autoFocus?: boolean; placeholder?: string;
    autoComplete?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    placeholder={placeholder ?? '••••••••'}
                    required
                    className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 pr-10
                               text-sm text-white placeholder:text-gray-700
                               focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15
                               transition-all duration-200"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                >
                    <EyeIcon visible={show} />
                </button>
            </div>
        </div>
    );
}

function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;
    const score = Math.min(
        (password.length >= 8 ? 1 : 0) +
        (password.length >= 12 ? 1 : 0) +
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/[0-9]/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
        4,
    );
    const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    const colors = ['', 'bg-red-500', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-400'];
    const textColors = ['', 'text-red-400', 'text-amber-400', 'text-sky-400', 'text-emerald-400'];
    return (
        <div className="space-y-1.5 mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-surface3'}`}
                    />
                ))}
            </div>
            {score > 0 && (
                <p className={`text-[10px] font-semibold ${textColors[score]}`}>{labels[score]}</p>
            )}
        </div>
    );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [current, setCurrent] = useState('');
    const [next,    setNext]    = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit() {
        if (next !== confirm) { setError('As senhas novas não coincidem.'); return; }
        if (next.length < 4)  { setError('A nova senha precisa ter ao menos 4 caracteres.'); return; }
        setLoading(true); setError(null);
        try {
            await ApiClient.getInstance().patch('/api/users/me/password', {
                currentPassword: current,
                newPassword:     next,
            });
            setSuccess(true);
            setCurrent(''); setNext(''); setConfirm('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao alterar senha.');
        } finally { setLoading(false); }
    }

    function handleClose() {
        setCurrent(''); setNext(''); setConfirm('');
        setError(null); setSuccess(false);
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose} title="Alterar Senha">
            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4 py-4"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                                <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <span className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-white">Senha alterada!</p>
                            <p className="text-xs text-gray-500">Sua senha foi atualizada com sucesso.</p>
                        </div>
                        <Button className="w-full justify-center mt-1" onClick={handleClose}>
                            Fechar
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <PasswordField
                            id="cp-current"
                            label="Senha atual"
                            value={current}
                            onChange={setCurrent}
                            autoFocus
                            autoComplete="off"
                        />

                        <div className="space-y-1">
                            <PasswordField
                                id="cp-new"
                                label="Nova senha"
                                value={next}
                                onChange={setNext}
                                placeholder="mín. 4 caracteres"
                                autoComplete="off"
                            />
                            <PasswordStrength password={next} />
                        </div>

                        <PasswordField
                            id="cp-confirm"
                            label="Confirmar nova senha"
                            value={confirm}
                            onChange={setConfirm}
                            autoComplete="off"
                        />

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="flex items-start gap-2.5 p-3 bg-red-500/8 border border-red-500/20 rounded-xl"
                                >
                                    <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                    </svg>
                                    <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 justify-center"
                                onClick={handleClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                loading={loading}
                                className="flex-1 justify-center"
                                onClick={handleSubmit}
                            >
                                Salvar senha
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-5 h-5">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
                {connected && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
                )}
            </div>
            <AnimatePresence mode="wait">
                <motion.span
                    key={connected ? 'on' : 'off'}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className={`text-xs font-medium ${connected ? 'text-emerald-400' : 'text-red-400'}`}
                >
                    {connected ? 'Tempo real' : 'Desconectado'}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

function UserAvatar({ name }: { name: string }) {
    const initials = name.slice(0, 2).toUpperCase();
    return (
        <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-[11px] font-bold text-white shadow-glow-primary/30">
            {initials}
        </div>
    );
}

export function TopBar() {
    const { user, logout } = useAuth();
    const { current } = useMetricsContext();
    const connected = current !== null;
    const [pwOpen, setPwOpen] = useState(false);

    return (
        <header className="h-14 glass bg-surface/80 border-b border-border/60 px-6 flex items-center justify-between sticky top-0 z-20">
            <ConnectionStatus connected={connected} />

            <div className="flex items-center gap-3">
                {user && (
                    <div className="flex items-center gap-2.5">
                        <UserAvatar name={user.name ?? 'U'} />
                        <div className="flex flex-col leading-none">
                            <span className="text-[13px] font-semibold text-gray-200">{user.name}</span>
                            <span className="text-[10px] text-primary-light uppercase tracking-wider font-bold mt-0.5">
                                {user.role}
                            </span>
                        </div>
                    </div>
                )}
                <div className="w-px h-5 bg-border/60 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => setPwOpen(true)} className="text-gray-500 hover:text-gray-200" title="Alterar senha">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Sair
                </Button>
            </div>

            <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
        </header>
    );
}
