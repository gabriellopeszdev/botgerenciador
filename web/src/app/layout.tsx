import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import './globals.css';

const outfit = Outfit({
    subsets:  ['latin'],
    variable: '--font-outfit',
    display:  'swap',
    weight:   ['300', '400', '500', '600', '700', '800', '900'],
});

const jetbrains = JetBrains_Mono({
    subsets:  ['latin'],
    variable: '--font-jetbrains',
    display:  'swap',
    weight:   ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title:       'HaxManager — Painel',
    description: 'Painel de controle para o Gerenciador de Salas Haxball',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={`${outfit.variable} ${jetbrains.variable}`}>
            <body>
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
