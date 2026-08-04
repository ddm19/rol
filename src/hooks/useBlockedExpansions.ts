import { useCallback, useEffect, useState } from 'react';
import { fetchBlockedExpansionSet, normalizeExpansionKey } from 'services/expansionLocks';

export function useBlockedExpansions() {
    const [blockedSet, setBlockedSet] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            const set = await fetchBlockedExpansionSet();
            setBlockedSet(set);
        } catch (err) {
            console.error('Error cargando expansiones bloqueadas', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const isBlocked = useCallback(
        (expansion?: string | null) => (expansion ? blockedSet.has(normalizeExpansionKey(expansion)) : false),
        [blockedSet]
    );

    return { isBlocked, loading, reload };
}
