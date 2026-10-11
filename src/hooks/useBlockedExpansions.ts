import { useCallback, useEffect, useState } from 'react';
import { fetchBlockedRarezasByExpansion, isRarezaBlocked } from 'services/expansionLocks';

export function useBlockedExpansions() {
    const [blockedMap, setBlockedMap] = useState<Map<string, Set<string>>>(new Map());
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            const map = await fetchBlockedRarezasByExpansion();
            setBlockedMap(map);
        } catch (err) {
            console.error('Error cargando rarezas bloqueadas', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const isBlocked = useCallback(
        (expansion?: string | null, rareza?: string | null) => isRarezaBlocked(blockedMap, expansion, rareza),
        [blockedMap]
    );

    return { isBlocked, loading, reload };
}
