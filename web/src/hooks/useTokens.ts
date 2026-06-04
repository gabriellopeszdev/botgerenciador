'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenRepository } from '@/core/repositories/TokenRepository';
import type { TokenItem } from '@/types/api';

export function useTokens() {
    const [tokens, setTokens]       = useState<TokenItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState<string | null>(null);

    const repo = useMemo(() => new TokenRepository(), []);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setTokens(await repo.listAll());
            setError(null);
        } catch {
            setError('Erro ao carregar tokens.');
        } finally {
            setIsLoading(false);
        }
    }, [repo]);

    useEffect(() => { load(); }, [load]);

    const register = useCallback(async (value: string, ownerId: string | null = null) => {
        await repo.register(value, ownerId);
        await load();
    }, [repo, load]);

    const remove = useCallback(async (id: string) => {
        await repo.remove(id);
        await load();
    }, [repo, load]);

    const autoGenerate = useCallback(async (ownerId: string | null = null) => {
        await repo.autoGenerate(ownerId);
        await load();
    }, [repo, load]);

    return { tokens, isLoading, error, register, remove, autoGenerate, refresh: load };
}
