'use client';
import { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'warning' | 'secondary';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?:    Size;
    loading?: boolean;
}

const variants: Record<Variant, string> = {
    primary:   'bg-primary hover:bg-primary-light text-white shadow-glow-primary/0 hover:shadow-glow-primary',
    secondary: 'bg-surface2 hover:bg-surface3 text-gray-200 border border-border hover:border-primary/40',
    success:   'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/50',
    danger:    'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-400/50',
    warning:   'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 hover:border-amber-400/50',
    ghost:     'bg-transparent hover:bg-surface2 text-gray-400 hover:text-white',
};

const sizes: Record<Size, string> = {
    xs: 'px-2 py-1 text-[11px] rounded-lg',
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-2.5 text-sm rounded-xl',
};

export function Button({
    variant = 'primary', size = 'md', loading = false,
    className, children, disabled, ...props
}: ButtonProps) {
    return (
        <motion.button
            {...(props as any)}
            whileTap={{ scale: 0.97 }}
            disabled={disabled || loading}
            className={clsx(
                'inline-flex items-center gap-2 font-semibold transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className,
            )}
        >
            {loading && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </motion.button>
    );
}
