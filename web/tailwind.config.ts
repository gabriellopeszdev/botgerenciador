import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                bg:       '#050810',
                surface:  '#08101E',
                surface2: '#0C1529',
                surface3: '#112033',
                border:   '#1B2D47',
                'border-subtle': '#142240',
                primary:  '#0EA5E9',
                'primary-light': '#38BDF8',
                'primary-dark':  '#0284C7',
            },
            fontFamily: {
                sans:    ['var(--font-outfit)', 'system-ui', 'sans-serif'],
                mono:    ['var(--font-jetbrains)', 'monospace'],
                display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow-primary': '0 0 24px rgba(14,165,233,0.3)',
                'glow-green':   '0 0 20px rgba(34,197,94,0.2)',
                'glow-red':     '0 0 20px rgba(239,68,68,0.2)',
                'card':         '0 4px 24px rgba(0,0,0,0.5)',
                'card-hover':   '0 8px 40px rgba(0,0,0,0.6)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                'gradient-surface': 'linear-gradient(180deg, #08101E 0%, #050810 100%)',
                'gradient-card':    'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(56,189,248,0.02) 100%)',
            },
            keyframes: {
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-ring': {
                    '0%':   { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(2)', opacity: '0' },
                },
                'scan': {
                    '0%':   { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
            },
            animation: {
                shimmer:      'shimmer 2s linear infinite',
                'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
                'scan':       'scan 8s linear infinite',
            },
        },
    },
    plugins: [],
};

export default config;
