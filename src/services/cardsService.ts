import { supabase } from './supabaseClient';
import { cachedQuery, invalidateCache, readCache } from './queryCache';

export type CardRecord = {
  id_archivo: string;
  nombre: string;
  coste: number | null;
  iniciativa: string | null;
  efecto: string | null;
  texto_ambientacion: string | null;
  color: string | null;
  color2: string | null;
  expansion: string | null;
  rareza: string | null;
  imagen_url: string | null;
  price?: number | null;
  visibility?: CardVisibility | null;
  reveal_at?: string | null;
  order_blocked?: boolean;
};

export type CardVisibility = 'visible' | 'spoiler' | 'hidden';

export type CardRohFields = {
  price: number | null;
  visibility: CardVisibility | null;
  reveal_at: string | null;
  order_blocked: boolean;
};

export type CardTypeRecord = {
  card_id_archivo: string;
  tipo: string;
};

export type CardStatsRecord = {
  card_id_archivo: string;
  ataque: number | null;
  dano_purga: number | null;
  vida: number | null;
};

export type CardDTO = CardRecord & {
  types: string[];
  stats?: CardStatsRecord | null;
};

const CARDS_CACHE_KEY = 'cards:v1';
const CARDS_CACHE_TTL_MS = 15 * 60 * 1000;

type CardRow = CardRecord & {
  card_types: { tipo: string }[] | null;
  card_stats: CardStatsRecord | CardStatsRecord[] | null;
};

async function fetchAllCardsFromDb(): Promise<CardDTO[]> {
  // Una sola petición: cartas con sus tipos y estadísticas embebidos
  const { data, error } = await supabase
    .from('cards')
    .select('*, card_types(tipo), card_stats(*)');

  if (error) throw error;
  if (!data) return [];

  return (data as CardRow[]).map(({ card_types, card_stats, ...card }) => ({
    ...card,
    types: (card_types || []).map((t) => t.tipo),
    stats: (Array.isArray(card_stats) ? card_stats[0] : card_stats) || null,
  }));
}

export function getCachedCards(): CardDTO[] | null {
  return readCache<CardDTO[]>(CARDS_CACHE_KEY, CARDS_CACHE_TTL_MS);
}

export function invalidateCardsCache() {
  invalidateCache(CARDS_CACHE_KEY);
}

export function fetchAllCards(options: { force?: boolean } = {}): Promise<CardDTO[]> {
  return cachedQuery(CARDS_CACHE_KEY, CARDS_CACHE_TTL_MS, fetchAllCardsFromDb, options);
}

// --- Administración: alta de cartas ---

const CARD_IMAGES_BUCKET = 'cards';

export const CARD_COLOR_PALETTE = ['#a66062', '#808080', '#5a417d', '#e5ba45', '#3a5945', '#495f73'];

export type AdminCardStats = {
  ataque?: string;
  dano_purga?: string;
  vida?: string;
};

export type AdminCardInput = {
  id_archivo: string;
  nombre: string;
  coste: string | number;
  iniciativa?: string | null;
  tipos: string[];
  efecto: string;
  texto_ambientacion?: string | null;
  color?: string | null;
  color2?: string | null;
  expansion?: string | null;
  rareza?: string | null;
  imagen_url?: string | null;
  estadisticas?: AdminCardStats | null;
};

function emptyToNull(value?: string | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'Desconocido') return null;
  return trimmed;
}

function parseCosteValue(value: string | number | undefined): number {
  const s = String(value ?? '').trim();
  if (s === '' || s === 'Desconocido' || s === 'X') return 0;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 0 : n;
}

function parseStatValue(value: string | undefined): number | null {
  const s = String(value ?? '').trim();
  if (s === '' || s === 'Desconocido' || s === 'X') return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

function stripDiacritics(value: string): string {
  return value
    .normalize('NFKD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0) || 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join('');
}

export function sanitizeFileName(name: string): string {
  const withoutAccents = stripDiacritics(name);
  const cleaned = withoutAccents.replace(/[^a-zA-Z0-9.]/g, '_');
  return cleaned.replace(/_+/g, '_');
}

export function normalizeKey(name: string): string {
  return stripDiacritics(name).toLowerCase().trim();
}

export async function uploadCardImage(file: File, idArchivo: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const safeName = sanitizeFileName(`${idArchivo}.${ext}`);
  const { error } = await supabase.storage
    .from(CARD_IMAGES_BUCKET)
    .upload(safeName, file, {
      cacheControl: '31536000',
      upsert: true,
      contentType: file.type || 'image/png',
    });
  if (error) throw error;

  const { data } = supabase.storage.from(CARD_IMAGES_BUCKET).getPublicUrl(safeName);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function upsertCardFull(input: AdminCardInput): Promise<void> {
  const idArchivo = input.id_archivo.trim();
  if (!idArchivo) throw new Error('id_archivo es obligatorio');
  if (!input.nombre?.trim()) throw new Error('nombre es obligatorio');

  const cardRecord: CardRecord = {
    id_archivo: idArchivo,
    nombre: input.nombre.trim(),
    coste: parseCosteValue(input.coste),
    iniciativa: emptyToNull(input.iniciativa),
    efecto: input.efecto?.trim() || '',
    texto_ambientacion: emptyToNull(input.texto_ambientacion),
    color: emptyToNull(input.color),
    color2: emptyToNull(input.color2),
    expansion: emptyToNull(input.expansion),
    rareza: emptyToNull(input.rareza),
    imagen_url: emptyToNull(input.imagen_url),
  };

  const { error: cardError } = await supabase
    .from('cards')
    .upsert(cardRecord, { onConflict: 'id_archivo' });
  if (cardError) throw cardError;

  const { error: delTypesError } = await supabase
    .from('card_types')
    .delete()
    .eq('card_id_archivo', idArchivo);
  if (delTypesError) throw delTypesError;

  const tipos = Array.from(new Set((input.tipos || []).map((t) => t.trim()).filter(Boolean)));
  if (tipos.length > 0) {
    const { error: typesError } = await supabase
      .from('card_types')
      .insert(tipos.map((tipo) => ({ card_id_archivo: idArchivo, tipo })));
    if (typesError) throw typesError;
  }

  const ataque = parseStatValue(input.estadisticas?.ataque);
  const danoPurga = parseStatValue(input.estadisticas?.dano_purga);
  const vida = parseStatValue(input.estadisticas?.vida);
  const hasStats = ataque !== null || danoPurga !== null || vida !== null;

  if (hasStats) {
    const { error: statsError } = await supabase
      .from('card_stats')
      .upsert(
        {
          card_id_archivo: idArchivo,
          ataque: ataque ?? 0,
          dano_purga: danoPurga ?? 0,
          vida: vida ?? 0,
        },
        { onConflict: 'card_id_archivo' }
      );
    if (statsError) throw statsError;
  } else {
    const { error: delStatsError } = await supabase
      .from('card_stats')
      .delete()
      .eq('card_id_archivo', idArchivo);
    if (delStatsError) throw delStatsError;
  }

  invalidateCardsCache();
}

export async function deleteCardFull(idArchivo: string): Promise<void> {
  const { error: statsError } = await supabase.from('card_stats').delete().eq('card_id_archivo', idArchivo);
  if (statsError) throw statsError;

  const { error: typesError } = await supabase.from('card_types').delete().eq('card_id_archivo', idArchivo);
  if (typesError) throw typesError;

  const { error: cardError } = await supabase.from('cards').delete().eq('id_archivo', idArchivo);
  if (cardError) throw cardError;

  invalidateCardsCache();
}

export async function updateCardRohFields(idArchivo: string, fields: Partial<CardRohFields>): Promise<void> {
  const { error } = await supabase.from('cards').update(fields).eq('id_archivo', idArchivo);
  if (error) throw error;
  invalidateCardsCache();
}

export async function updateCardsRohFields(idsArchivo: string[], fields: Partial<CardRohFields>): Promise<void> {
  if (idsArchivo.length === 0) return;
  const { error } = await supabase.from('cards').update(fields).in('id_archivo', idsArchivo);
  if (error) throw error;
  invalidateCardsCache();
}

export async function clearExpansionCardOverrides(expansion: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ visibility: null, reveal_at: null })
    .eq('expansion', expansion);
  if (error) throw error;
  invalidateCardsCache();
}

export async function fetchFacets(isIncluded: (card: CardDTO) => boolean = () => true) {
  const cards = (await fetchAllCards()).filter(isIncluded);

  const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };
  const distinct = (values: (string | null | undefined)[]) =>
    Array.from(new Set(values.filter((v): v is string => v != null).map(capitalize))).filter(Boolean);

  const maxCost = cards.reduce((max, c) => Math.max(max, c.coste || 0), 0) || 10;

  return {
    tipos: distinct(cards.flatMap((c) => c.types)),
    colores: distinct(cards.map((c) => c.color)),
    expansions: distinct(cards.map((c) => c.expansion)),
    rarezas: distinct(cards.map((c) => c.rareza)),
    maxCost,
  };
}
