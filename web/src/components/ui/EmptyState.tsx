import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface Props {
    icon:        ReactNode;
    title:       string;
    description: string;
    action?:     ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="w-14 h-14 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-4 text-gray-600">
                {icon}
            </div>
            <p className="text-sm font-semibold text-gray-400">{title}</p>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    );
}
