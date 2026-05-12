import { useEffect, useMemo, useState } from 'react';
import { fetchAllCards, CardDTO } from 'services/cardsService';

export type Filters = {
  query: string;
  tipos: string[];
  colores: string[];
  expansion: string | null;
  rareza: string | null;
  costeMin?: number | null;
  costeMax?: number | null;
};

export type SortOption = 'name_asc' | 'cost_asc' | 'cost_desc';

export function useCardSearch() {
  const [all, setAll] = useState<CardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);
  const [colores, setColores] = useState<string[]>([]);
  const [expansion, setExpansion] = useState<string | null>(null);
  const [rareza, setRareza] = useState<string | null>(null);
  const [costeMin, setCosteMin] = useState<number | null>(null);
  const [costeMax, setCosteMax] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('name_asc');

  // fetch data once
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const cards = await fetchAllCards();
        if (!mounted) return;
        setAll(cards);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // debounce query
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const filtered = useMemo(() => {
    if (!all || all.length === 0) return [] as CardDTO[];

    const q = debouncedQuery.toLowerCase();

    const result = all.filter((c) => {
      // text search against nombre and efecto
      if (q) {
        const haystack = `${c.nombre} ${c.efecto || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // tipos (multi-select): card must include any of the selected tipos
      if (tipos.length > 0) {
        const has = (c.types || []).some((t) => tipos.some((selected) => selected.toLowerCase() === t.toLowerCase()));
        if (!has) return false;
      }

      // colores: if colores selected, card must match all selected colors (treat color/color2 as set)
      if (colores.length > 0) {
        const cardColors = [c.color, c.color2].filter(Boolean) as string[];
        // every selected color must be present in cardColors (case-insensitive)
        const ok = colores.every((col) => cardColors.some((cc) => cc.toLowerCase() === col.toLowerCase()));
        if (!ok) return false;
      }

      if (expansion && c.expansion?.toLowerCase() !== expansion.toLowerCase()) return false;
      if (rareza && c.rareza?.toLowerCase() !== rareza.toLowerCase()) return false;

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
  }, [all, debouncedQuery, tipos, colores, expansion, rareza, costeMin, costeMax, sort]);

  return {
    loading,
    results: filtered,
    // state setters
    query,
    setQuery,
    tipos,
    setTipos,
    colores,
    setColores,
    expansion,
    setExpansion,
    rareza,
    setRareza,
    costeMin,
    setCosteMin,
    costeMax,
    setCosteMax,
    sort,
    setSort,
    // raw data for facets if needed
    all,
  };
}

export default useCardSearch;
