'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

const Icons = {
    Dashboard: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    ),
    Rooms: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <path d="M12 12v4M10 14h4" />
        </svg>
    ),
    Bots: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2z" />
            <path d="M9 12h.01M15 12h.01M9 16h6" />
        </svg>
    ),
    MyBots: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 18l2 2 4-4" />
            <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v6" />
            <path d="M7 5H4a2 2 0 00-2 2v10a2 2 0 002 2h9" />
        </svg>
    ),
    Tokens: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="15" r="4" />
            <path d="M12 15h8M16 11v8" />
        </svg>
    ),
    History: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    ),
    Server: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="5" rx="1.5" />
            <rect x="2" y="10" width="20" height="5" rx="1.5" />
            <rect x="2" y="17" width="20" height="4" rx="1.5" />
            <circle cx="6" cy="5.5" r="0.8" fill="currentColor" />
            <circle cx="6" cy="12.5" r="0.8" fill="currentColor" />
        </svg>
    ),
    Users: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="7" r="3" /><circle cx="16" cy="7" r="3" />
            <path d="M2 20c0-3.314 2.686-6 6-6h4" />
            <path d="M16 14c2.21 0 4 1.79 4 4v2h-8v-2c0-2.21 1.79-4 4-4z" />
        </svg>
    ),
    Audit: () => (
        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h6M9 16h4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
        </svg>
    ),
};

const baseLinks = [
    { href: '/dashboard',         label: 'Visão Geral', Icon: Icons.Dashboard, adminOnly: true  },
    { href: '/dashboard/rooms',   label: 'Salas',       Icon: Icons.Rooms,     adminOnly: false },
    { href: '/dashboard/bots',    label: 'Bots',        Icon: Icons.Bots,      adminOnly: true  },
    { href: '/dashboard/my-bots', label: 'Meus Bots',   Icon: Icons.MyBots,    adminOnly: false },
    { href: '/dashboard/tokens',  label: 'Tokens',      Icon: Icons.Tokens,    adminOnly: false },
    { href: '/dashboard/history', label: 'Histórico',   Icon: Icons.History,   adminOnly: false },
    { href: '/dashboard/server',  label: 'Servidor',    Icon: Icons.Server,    adminOnly: true  },
    { href: '/dashboard/users',   label: 'Usuários',    Icon: Icons.Users,     adminOnly: true  },
    { href: '/dashboard/audit',   label: 'Audit Log',   Icon: Icons.Audit,     adminOnly: true  },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isAdmin } = useAuth();
    const links = baseLinks.filter(l => !l.adminOnly || isAdmin);

    return (
        <aside className="w-[216px] shrink-0 flex flex-col h-screen sticky top-0 border-r border-border/50 bg-surface/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="px-5 pt-6 pb-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M8 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM8 14c2 2 6 2 8 0" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[15px] font-black text-white leading-none tracking-tight">HaxManager</h1>
                        <p className="text-[9px] text-primary/60 uppercase tracking-[0.18em] mt-0.5 font-semibold">Painel de Controle</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 py-2 font-bold">Menu</p>
                {links.map(({ href, label, Icon }, i) => {
                    const active = href === '/dashboard'
                        ? pathname === href
                        : pathname.startsWith(href);

                    return (
                        <motion.div
                            key={href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.25 }}
                        >
                            <Link
                                href={href}
                                className={clsx(
                                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 group overflow-hidden',
                                    active
                                        ? 'text-white font-semibold'
                                        : 'text-gray-500 hover:text-gray-200 hover:bg-surface2',
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="sidebar-active-bg"
                                        className="absolute inset-0 bg-primary/10 rounded-lg"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    />
                                )}
                                {active && (
                                    <motion.div
                                        layoutId="sidebar-active-bar"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    />
                                )}
                                <span className={clsx(
                                    'relative z-10 transition-colors duration-200',
                                    active ? 'text-primary-light' : 'text-gray-600 group-hover:text-gray-300',
                                )}>
                                    <Icon />
                                </span>
                                <span className="relative z-10">{label}</span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-gray-600 font-data">v1.0 · online</span>
                </div>
            </div>
        </aside>
    );
}
