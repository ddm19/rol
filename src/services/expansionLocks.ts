import { supabase } from './supabaseClient';
import { normalizeKey } from './cardsService';

export type BlockedExpansionRecord = {
    expansion: string;
    // Lista de rarezas bloqueadas para pedidos de cartas sueltas en esta expansion.
    // Vacia o null = sin restricciones (se puede pedir cualquier rareza).
    blocked: string[] | null;
};

const BLOCKED_EXPANSIONS_TABLE = 'card_expansions';

export function normalizeExpansionKey(expansion: string): string {
    return normalizeKey(expansion.replace(/-L$/i, ''));
}

export async function fetchBlockedExpansions(): Promise<BlockedExpansionRecord[]> {
    const { data, error } = await supabase
        .from(BLOCKED_EXPANSIONS_TABLE)
        .select('expansion, blocked');

    if (error) throw error;
    return (data || []).filter((row) => Array.isArray(row.blocked) && row.blocked.length > 0);
}

// Mapa: expansion normalizada -> set de rarezas bloqueadas (normalizadas) para esa expansion
export async function fetchBlockedRarezasByExpansion(): Promise<Map<string, Set<string>>> {
    const rows = await fetchBlockedExpansions();
    const map = new Map<string, Set<string>>();
    rows.forEach((row) => {
        map.set(normalizeExpansionKey(row.expansion), new Set((row.blocked || []).map(normalizeKey)));
    });
    return map;
}

export function isRarezaBlocked(
    map: Map<string, Set<string>>,
    expansion?: string | null,
    rareza?: string | null
): boolean {
    if (!expansion || !rareza) return false;
    const blockedRarezas = map.get(normalizeExpansionKey(expansion));
    return blockedRarezas ? blockedRarezas.has(normalizeKey(rareza)) : false;
}

export async function assertCardsNotBlocked(cardIds: string[]): Promise<void> {
    const ids = Array.from(new Set(cardIds.filter(Boolean)));
    if (ids.length === 0) return;

    const map = await fetchBlockedRarezasByExpansion();
    if (map.size === 0) return;

    const { data: cards, error } = await supabase
        .from('cards')
        .select('id_archivo, nombre, expansion, rareza')
        .in('id_archivo', ids);
    if (error) throw error;

    const offending = (cards || []).filter((c) => isRarezaBlocked(map, c.expansion, c.rareza));
    if (offending.length > 0) {
        const names = offending.map((c) => c.nombre).join(', ');
        throw new Error(`No se pueden pedir estas cartas ahora mismo: ${names}`);
    }
}
