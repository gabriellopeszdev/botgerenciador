import { clsx } from 'clsx';

type Color = 'green' | 'blue' | 'red' | 'yellow' | 'gray' | 'purple';

const colors: Record<Color, string> = {
    green:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-glow-green/50',
    blue:   'bg-primary/15 text-primary-light border border-primary/25',
    red:    'bg-red-500/15 text-red-400 border border-red-500/25',
    yellow: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    gray:   'bg-white/5 text-gray-400 border border-white/10',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
};

const dots: Record<Color, string> = {
    green:  'bg-emerald-400',
    blue:   'bg-primary-light',
    red:    'bg-red-400',
    yellow: 'bg-amber-400',
    gray:   'bg-gray-500',
    purple: 'bg-purple-400',
};

export function Badge({
    color = 'gray',
    dot = false,
    children,
}: {
    color?: Color;
    dot?: boolean;
    children: React.ReactNode;
}) {
    return (
        <span className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide',
            colors[color],
        )}>
            {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dots[color])} />}
            {children}
        </span>
    );
}
