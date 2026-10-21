import { supabase } from './supabaseClient';
import { cachedQuery, invalidateCache } from './queryCache';

export type PackTypeRecord = {
    id: string;
    nombre: string;
    expansion: string;
    tipo: 'normal' | 'legendario';
    imagen_url: string | null;
    orden: number;
    activo: boolean;
    precio: number | null;
    descripcion: string | null;
};

const PACK_TYPES_TABLE = 'roh_pack_types';
const PACK_TYPES_CACHE_KEY = 'roh_pack_types:v1';
const PACK_TYPES_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchPackTypesFromDb(): Promise<PackTypeRecord[]> {
    const { data, error } = await supabase
        .from(PACK_TYPES_TABLE)
        .select('id, nombre, expansion, tipo, imagen_url, orden, activo, precio, descripcion')
        .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
}

export function fetchPackTypes(options: { force?: boolean } = {}): Promise<PackTypeRecord[]> {
    return cachedQuery(PACK_TYPES_CACHE_KEY, PACK_TYPES_CACHE_TTL_MS, fetchPackTypesFromDb, options);
}

export function invalidatePackTypesCache() {
    invalidateCache(PACK_TYPES_CACHE_KEY);
}

export async function upsertPackType(record: PackTypeRecord): Promise<void> {
    const { error } = await supabase
        .from(PACK_TYPES_TABLE)
        .upsert(record, { onConflict: 'id' });
    if (error) throw error;
    invalidateCache(PACK_TYPES_CACHE_KEY);
}

export async function createSingleUsePackCode(packTypeId: string): Promise<string> {
    const { data, error } = await supabase.rpc('roh_admin_crear_codigo_sobre', { p_pack_type: packTypeId });
    if (error) throw error;
    return data as string;
}
