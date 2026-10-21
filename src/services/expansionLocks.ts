import { supabase } from './supabaseClient';
import { CardVisibility, normalizeKey } from './cardsService';
import { cachedQuery, invalidateCache } from './queryCache';

export type ExpansionRecord = {
    expansion: string;
    blocked: string[] | null;
    visibility: CardVisibility;
    order_blocked: boolean;
};

const EXPANSIONS_TABLE = 'card_expansions';
const EXPANSIONS_CACHE_KEY = 'card_expansions:v2';
const EXPANSIONS_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchExpansionsFromDb(): Promise<ExpansionRecord[]> {
    const { data, error } = await supabase
        .from(EXPANSIONS_TABLE)
        .select('expansion, blocked, visibility, order_blocked');

    if (error) throw error;
    return data || [];
}

export function fetchExpansions(options: { force?: boolean } = {}): Promise<ExpansionRecord[]> {
    return cachedQuery(EXPANSIONS_CACHE_KEY, EXPANSIONS_CACHE_TTL_MS, fetchExpansionsFromDb, options);
}

export async function fetchExpansionsByKey(options: { force?: boolean } = {}): Promise<Map<string, ExpansionRecord>> {
    const rows = await fetchExpansions(options);
    return new Map(rows.map((row) => [normalizeKey(row.expansion), row]));
}

export function invalidateExpansionsCache() {
    invalidateCache(EXPANSIONS_CACHE_KEY);
}

export async function upsertExpansion(record: ExpansionRecord): Promise<void> {
    const { error } = await supabase
        .from(EXPANSIONS_TABLE)
        .upsert(record, { onConflict: 'expansion' });
    if (error) throw error;
    invalidateCache(EXPANSIONS_CACHE_KEY);
}
