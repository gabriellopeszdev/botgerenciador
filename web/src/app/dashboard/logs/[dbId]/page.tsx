'use client';
import { use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LogViewer } from '@/components/cmpLogs/LogViewer';
import { useLogs } from '@/hooks/useLogs';

export default function RoomLogsPage({ params }: { params: Promise<{ dbId: string }> }) {
    const { dbId } = use(params);
    const { logs, isLoading } = useLogs(dbId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/rooms" className="text-xs text-gray-500 hover:text-white">← Salas</Link>
                    <h1 className="text-xl font-bold mt-1">Logs da sala</h1>
                    <p className="text-xs text-gray-500 font-mono">{dbId}</p>
                </div>
            </div>
            <Card>
                <LogViewer logs={logs} isLoading={isLoading} />
            </Card>
        </div>
    );
}
