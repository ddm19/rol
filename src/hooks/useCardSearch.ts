import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAllCards, CardDTO } from 'services/cardsService';

export type Filters = {
  query: string;
  tipos: string[];
  colores: string[];
  expansions: string[];
  rarezas: string[];
  costeMin?: number | null;
  costeMax?: number | null;
};

export type SortOption = 'name_asc' | 'cost_asc' | 'cost_desc';

export const normalizeString = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export function useCardSearch() {
  const [all, setAll] = useState<CardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);
  const [colores, setColores] = useState<string[]>([]);
  const [colorMatchMode, setColorMatchMode] = useState<'AND' | 'OR'>('OR');
  const [expansions, setExpansions] = useState<string[]>([]);
  const [rarezas, setRarezas] = useState<string[]>([]);
  const [costeMin, setCosteMin] = useState<number | null>(null);
  const [costeMax, setCosteMax] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('name_asc');

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const cards = await fetchAllCards();
      setAll(cards);
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch data once
  useEffect(() => {
    refetch();
  }, [refetch]);

  // debounce query
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(normalizeString(query.trim())), 300);
    return () => clearTimeout(id);
  }, [query]);

  const filtered = useMemo(() => {
    if (!all || all.length === 0) return [] as CardDTO[];

    const result = all.filter((c) => {
      // text search against nombre and efecto
      if (debouncedQuery) {
        const haystack = normalizeString(`${c.nombre} ${c.efecto || ''}`);
        if (!haystack.includes(debouncedQuery)) return false;
      }

      // tipos (AND logic): card must include ALL of the selected tipos
      if (tipos.length > 0) {
        const hasAll = tipos.every((selected) => 
          (c.types || []).some((t) => normalizeString(selected) === normalizeString(t))
        );
        if (!hasAll) return false;
      }

      // colores
      if (colores.length > 0) {
        const cardColors = [c.color, c.color2].filter(Boolean) as string[];
        if (colorMatchMode === 'AND') {
          // every selected color must be present in cardColors
          const ok = colores.every((col) => cardColors.some((cc) => normalizeString(cc) === normalizeString(col)));
          if (!ok) return false;
        } else {
          // OR: at least one selected color must be present
          const ok = colores.some((col) => cardColors.some((cc) => normalizeString(cc) === normalizeString(col)));
          if (!ok) return false;
        }
      }

      if (expansions.length > 0) {
        const ok = expansions.some((ex) => normalizeString(c.expansion || '') === normalizeString(ex));
        if (!ok) return false;
      }
      if (rarezas.length > 0) {
        const ok = rarezas.some((r) => normalizeString(c.rareza || '') === normalizeString(r));
        if (!ok) return false;
      }

      const coste = typeof c.coste === 'number' ? c.coste : null;
      if (costeMin != null && (coste == null || coste < costeMin)) return false;
      if (costeMax != null && (coste == null || coste > costeMax)) return false;

      return true;
    });

    // sorting
    const sorted = result.sort((a, b) => {
      if (sort === 'name_asc') return a.nombre.localeCompare(b.nombre);
      if (sort === 'cost_asc') return (a.coste || 0) - (b.coste || 0);
      if (sort === 'cost_desc') return (b.coste || 0) - (a.coste || 0);
      return 0;
    });

    return sorted;
  }, [all, debouncedQuery, tipos, colores, colorMatchMode, expansions, rarezas, costeMin, costeMax, sort]);

  const availableTipos = useMemo(() => {
    const typesSet = new Set<string>();
    filtered.forEach(c => {
      (c.types || []).forEach(t => typesSet.add(normalizeString(t)));
    });
    return typesSet;
  }, [filtered]);

  return {
    loading,
    results: filtered,
    query,
    setQuery,
    tipos,
    setTipos,
    colores,
    setColores,
    colorMatchMode,
    setColorMatchMode,
    expansions,
    setExpansions,
    rarezas,
    setRarezas,
    costeMin,
    setCosteMin,
    costeMax,
    setCosteMax,
    sort,
    setSort,
    all,
    availableTipos,
    refetch
  };
}

export default useCardSearch;
