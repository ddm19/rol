import { supabase } from './supabaseClient';
import { normalizeKey } from './cardsService';
import { cachedQuery, invalidateCache } from './queryCache';

export type RarityPriceRecord = {
    rareza: string;
    expansion: string;
    price: number;
};

const RARITY_PRICES_TABLE = 'roh_rarity_prices';
const RARITY_PRICES_CACHE_KEY = 'roh_rarity_prices:v2';
const RARITY_PRICES_CACHE_TTL_MS = 5 * 60 * 1000;

export const GENERAL_PRICE_EXPANSION = '';

export function rarityPriceKey(rareza: string, expansion: string = GENERAL_PRICE_EXPANSION): string {
    return `${normalizeKey(expansion)}|${normalizeKey(rareza)}`;
}

async function fetchRarityPricesFromDb(): Promise<RarityPriceRecord[]> {
    const { data, error } = await supabase
        .from(RARITY_PRICES_TABLE)
        .select('rareza, expansion, price');

    if (error) throw error;
    return data || [];
}

export function fetchRarityPrices(options: { force?: boolean } = {}): Promise<RarityPriceRecord[]> {
    return cachedQuery(RARITY_PRICES_CACHE_KEY, RARITY_PRICES_CACHE_TTL_MS, fetchRarityPricesFromDb, options);
}

export async function fetchRarityPricesByKey(options: { force?: boolean } = {}): Promise<Map<string, number>> {
    const rows = await fetchRarityPrices(options);
    return new Map(rows.map((row) => [rarityPriceKey(row.rareza, row.expansion), row.price]));
}

export function invalidateRarityPricesCache() {
    invalidateCache(RARITY_PRICES_CACHE_KEY);
}

export async function saveRarityPrice(rareza: string, expansion: string, price: number | null): Promise<void> {
    const { error } = price === null
        ? await supabase.from(RARITY_PRICES_TABLE).delete().eq('rareza', rareza).eq('expansion', expansion)
        : await supabase.from(RARITY_PRICES_TABLE).upsert({ rareza, expansion, price }, { onConflict: 'rareza,expansion' });
    if (error) throw error;
    invalidateCache(RARITY_PRICES_CACHE_KEY);
}
