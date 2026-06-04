import { type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/options';
import { RoomsProvider }  from '@/contexts/RoomsContext';
import { MetricsProvider } from '@/contexts/MetricsContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar }  from '@/components/layout/TopBar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    return (
        <RoomsProvider>
            <MetricsProvider>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <TopBar />
                        <main className="flex-1 p-6 md:p-8 overflow-auto max-w-7xl w-full mx-auto">{children}</main>
                    </div>
                </div>
            </MetricsProvider>
        </RoomsProvider>
    );
}
