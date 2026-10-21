import { useCallback, useEffect, useState } from 'react';
import { CardDTO, CardVisibility, fetchAllCards, normalizeKey } from 'services/cardsService';
import { ExpansionRecord, fetchExpansions } from 'services/expansionLocks';

export const VISIBILITY_LABELS: Record<CardVisibility, string> = {
    visible: 'Visible',
    spoiler: 'Solo spoilers',
    hidden: 'Oculta',
};

export type RohExpansion = ExpansionRecord & {
    rarezas: string[];
};

const defaultExpansion = (expansion: string): ExpansionRecord => ({
    expansion,
    blocked: [],
    visibility: 'visible',
    order_blocked: false,
});

function buildExpansions(cards: CardDTO[], rows: ExpansionRecord[]): RohExpansion[] {
    const byKey = new Map<string, RohExpansion>();
    rows.forEach((row) => byKey.set(normalizeKey(row.expansion), { ...row, rarezas: [] }));
    cards.forEach((card) => {
        if (!card.expansion) return;
        const key = normalizeKey(card.expansion);
        const entry = byKey.get(key) || { ...defaultExpansion(card.expansion), rarezas: [] };
        if (card.rareza && !entry.rarezas.some((r) => normalizeKey(r) === normalizeKey(card.rareza || ''))) {
            entry.rarezas.push(card.rareza);
        }
        byKey.set(key, entry);
    });
    return Array.from(byKey.values()).sort((a, b) => a.expansion.localeCompare(b.expansion));
}

export function useRohExpansions() {
    const [expansions, setExpansions] = useState<RohExpansion[]>([]);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const [cards, rows] = await Promise.all([fetchAllCards(), fetchExpansions({ force: true })]);
            setExpansions(buildExpansions(cards, rows));
        } catch (err: any) {
            setError(err?.message || 'Error cargando expansiones');
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { expansions, error, reload };
}
