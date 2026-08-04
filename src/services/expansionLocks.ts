import { supabase } from './supabaseClient';
import { normalizeKey } from './cardsService';

export type BlockedExpansionRecord = {
    expansion: string;
    blocked: boolean;
};

const BLOCKED_EXPANSIONS_TABLE = 'card_expansions';

export function normalizeExpansionKey(expansion: string): string {
    return normalizeKey(expansion.replace(/-L$/i, ''));
}

export async function fetchBlockedExpansions(): Promise<BlockedExpansionRecord[]> {
    const { data, error } = await supabase
        .from(BLOCKED_EXPANSIONS_TABLE)
        .select('expansion, blocked')
        .eq('blocked', true);

    if (error) throw error;
    return data || [];
}

export async function fetchBlockedExpansionSet(): Promise<Set<string>> {
    const rows = await fetchBlockedExpansions();
    return new Set(rows.map((row) => normalizeExpansionKey(row.expansion)));
}


export async function assertCardsNotBlocked(cardIds: string[]): Promise<void> {
    const ids = Array.from(new Set(cardIds.filter(Boolean)));
    if (ids.length === 0) return;

    const set = await fetchBlockedExpansionSet();
    if (set.size === 0) return;

    const { data: cards, error } = await supabase
        .from('cards')
        .select('id_archivo, nombre, expansion')
        .in('id_archivo', ids);
    if (error) throw error;

    const offending = (cards || []).filter((c) => c.expansion && set.has(normalizeExpansionKey(c.expansion)));
    if (offending.length > 0) {
        const names = offending.map((c) => c.nombre).join(', ');
        throw new Error(`No se pueden pedir estas cartas ahora mismo: ${names}`);
    }
}

export async function assertExpansionNotBlocked(expansion: string): Promise<void> {
    const set = await fetchBlockedExpansionSet();
    if (set.has(normalizeExpansionKey(expansion))) {
        throw new Error(`Los pedidos de "${expansion}" no están disponibles ahora mismo.`);
    }
}
