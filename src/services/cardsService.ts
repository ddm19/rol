import { supabase } from './supabaseClient';

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

export async function fetchAllCards(): Promise<CardDTO[]> {
  // Fetch base card records
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*');

  if (cardsError) throw cardsError;
  if (!cards) return [];

  // Fetch types and stats for all cards in parallel
  const ids = cards.map((c) => c.id_archivo);

  const { data: types } = await supabase
    .from('card_types')
    .select('*')
    .in('card_id_archivo', ids as any);

  const { data: stats } = await supabase
    .from('card_stats')
    .select('*')
    .in('card_id_archivo', ids as any);

  const typesById: Record<string, string[]> = {};
  (types || []).forEach((t) => {
    typesById[t.card_id_archivo] = typesById[t.card_id_archivo] || [];
    typesById[t.card_id_archivo].push(t.tipo);
  });

  const statsById: Record<string, CardStatsRecord> = {};
  (stats || []).forEach((s) => {
    statsById[s.card_id_archivo] = s;
  });

  return cards.map((c) => ({
    ...c,
    types: typesById[c.id_archivo] || [],
    stats: statsById[c.id_archivo] || null,
  }));
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
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/png',
    });
  if (error) throw error;

  const { data } = supabase.storage.from(CARD_IMAGES_BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
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
}

export async function deleteCardFull(idArchivo: string): Promise<void> {
  const { error: statsError } = await supabase.from('card_stats').delete().eq('card_id_archivo', idArchivo);
  if (statsError) throw statsError;

  const { error: typesError } = await supabase.from('card_types').delete().eq('card_id_archivo', idArchivo);
  if (typesError) throw typesError;

  const { error: cardError } = await supabase.from('cards').delete().eq('id_archivo', idArchivo);
  if (cardError) throw cardError;
}

export async function fetchFacets() {
  // Fetch distinct values for filters: tipos, colores, expansions, rarezas, and max coste
  const [{ data: tipos }, { data: colores }, { data: expansions }, { data: rarezas }, { data: cardsForCost }] = await Promise.all([
    supabase.from('card_types').select('tipo').neq('tipo', null),
    supabase.from('cards').select('color').neq('color', null),
    supabase.from('cards').select('expansion').neq('expansion', null),
    supabase.from('cards').select('rareza').neq('rareza', null),
    supabase.from('cards').select('coste').neq('coste', null),
  ]);

  const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const maxCost = cardsForCost?.reduce((max, c) => Math.max(max, c.coste || 0), 0) || 10;

  return {
    tipos: Array.from(new Set((tipos || []).map((t: any) => capitalize(t.tipo)))).filter(Boolean),
    colores: Array.from(new Set((colores || []).map((c: any) => capitalize(c.color)))).filter(Boolean),
    expansions: Array.from(new Set((expansions || []).map((e: any) => capitalize(e.expansion)))).filter(Boolean),
    rarezas: Array.from(new Set((rarezas || []).map((r: any) => capitalize(r.rareza)))).filter(Boolean),
    maxCost,
  };
}
