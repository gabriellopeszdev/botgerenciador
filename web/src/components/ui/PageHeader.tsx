'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface Props {
    title:       string;
    description?: string;
    action?:     ReactNode;
    badge?:      { label: string; color: string };
}

export function PageHeader({ title, description, action, badge }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4"
        >
            <div>
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-1 h-5 rounded-full bg-gradient-primary shrink-0" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                    {badge && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-gray-500 ml-3">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </motion.div>
    );
}
