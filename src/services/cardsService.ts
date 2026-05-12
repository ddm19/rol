import { supabase } from './supabaseClient';

export type CardRecord = {
  id_archivo: string;
  nombre: string;
  coste: number | null;
  iniciativa: number | null;
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
