import { supabase } from './supabaseClient';
import { cachedQuery, invalidateCache } from './queryCache';

export type RohSettings = {
    coins_per_claim: number;
    claim_interval_days: number;
    spoiler_expansion: string | null;
    spoiler_description: string | null;
    spoiler_release_at: string | null;
    transfer_max_received: number;
    transfer_period_days: number;
};

const ROH_SETTINGS_TABLE = 'roh_settings';
const ROH_SETTINGS_CACHE_KEY = 'roh_settings:v3';
const ROH_SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchRohSettingsFromDb(): Promise<RohSettings> {
    const { data, error } = await supabase
        .from(ROH_SETTINGS_TABLE)
        .select('coins_per_claim, claim_interval_days, spoiler_expansion, spoiler_description, spoiler_release_at, transfer_max_received, transfer_period_days')
        .eq('id', 1)
        .single();

    if (error) throw error;
    return data;
}

export function fetchRohSettings(options: { force?: boolean } = {}): Promise<RohSettings> {
    return cachedQuery(ROH_SETTINGS_CACHE_KEY, ROH_SETTINGS_CACHE_TTL_MS, fetchRohSettingsFromDb, options);
}

export function invalidateRohSettingsCache() {
    invalidateCache(ROH_SETTINGS_CACHE_KEY);
}

export async function updateRohSettings(fields: Partial<RohSettings>): Promise<void> {
    const { error } = await supabase
        .from(ROH_SETTINGS_TABLE)
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', 1);
    if (error) throw error;
    invalidateCache(ROH_SETTINGS_CACHE_KEY);
}
