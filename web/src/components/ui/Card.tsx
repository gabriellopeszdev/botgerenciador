'use client';
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
    title?:       string;
    action?:      ReactNode;
    children:     ReactNode;
    className?:   string;
    noPadding?:   boolean;
    hover?:       boolean;
    glow?:        boolean;
}

export function Card({ title, action, children, className, noPadding, hover, glow }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
            className={clsx(
                'bg-surface border border-border rounded-2xl overflow-hidden',
                'transition-shadow duration-300',
                glow ? 'card-glow' : 'shadow-card hover:shadow-card-hover',
                className,
            )}
        >
            {title && (
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <span className="text-sm font-semibold text-gray-200 tracking-tight">{title}</span>
                    {action && <div className="flex items-center gap-2">{action}</div>}
                </div>
            )}
            <div className={clsx(!noPadding && 'p-5')}>{children}</div>
        </motion.div>
    );
}
