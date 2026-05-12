import React, { useMemo, useState } from 'react';
import Slider from '@mui/material/Slider';
import './filtersPanel.scss';
import { normalizeString } from 'hooks/useCardSearch';

type Props = {
    // facets to populate controls
    tipos: string[];
    availableTipos: Set<string>;
    colores: string[];
    expansions: string[];
    rarezas: string[];
    maxCostAvailable: number;

    // controlled state from hook
    query: string;
    setQuery: (v: string) => void;
    tiposSelected: string[];
    setTiposSelected: (v: string[]) => void;
    coloresSelected: string[];
    setColoresSelected: (v: string[]) => void;
    colorMatchMode: 'AND' | 'OR';
    setColorMatchMode: (v: 'AND' | 'OR') => void;
    expansion: string | null;
    setExpansion: (v: string | null) => void;
    rareza: string | null;
    setRareza: (v: string | null) => void;
    costeMin: number | null;
    setCosteMin: (v: number | null) => void;
    costeMax: number | null;
    setCosteMax: (v: number | null) => void;
    sort: string;
    setSort: (v: any) => void;
};

const GENERAL_TYPES = [
    'Líder', 'Criatura', 'Dote', 'Runa', 'Conjuro', 'Trampa', 'Objeto', 'Objeto Mágico'
];

const GENERAL_TYPES_NORMALIZED = GENERAL_TYPES.map(normalizeString);

const COLOR_MAP: Record<string, string> = {
    '#ff0000': 'Rojo',
    '#0000ff': 'Azul',
    '#ffff00': 'Amarillo',
    '#00ff00': 'Verde',
    '#800080': 'Morado',
};

const getDisplayColorName = (hex: string) => {
    return COLOR_MAP[hex.toLowerCase()] || hex;
};

const FiltersPanel: React.FC<Props> = (props) => {
    const {
        tipos,
        availableTipos,
        colores,
        expansions,
        rarezas,
        maxCostAvailable,
        query,
        setQuery,
        tiposSelected,
        setTiposSelected,
        coloresSelected,
        setColoresSelected,
        colorMatchMode,
        setColorMatchMode,
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
    } = props;

    const [tiposSearch, setTiposSearch] = useState('');
    const [showAllTipos, setShowAllTipos] = useState(false);

    const toggleTipo = (t: string) => {
        if (tiposSelected.includes(t)) setTiposSelected(tiposSelected.filter((x) => x !== t));
        else setTiposSelected([...tiposSelected, t]);
    };

    const toggleColor = (c: string) => {
        if (coloresSelected.includes(c)) setColoresSelected(coloresSelected.filter((x) => x !== c));
        else setColoresSelected([...coloresSelected, c]);
    };

    const onReset = () => {
        setQuery('');
        setTiposSelected([]);
        setColoresSelected([]);
        setColorMatchMode('OR');
        setExpansion(null);
        setRareza(null);
        setCosteMin(null);
        setCosteMax(null);
        setSort('name_asc');
        setTiposSearch('');
        setShowAllTipos(false);
    };

    const { generalTipos, subTipos } = useMemo(() => {
        const g: string[] = [];
        const s: string[] = [];
        tipos.forEach(t => {
            if (GENERAL_TYPES_NORMALIZED.includes(normalizeString(t))) {
                g.push(t);
            } else {
                if (availableTipos.has(normalizeString(t))) {
                    s.push(t);
                }
            }
        });
        
        tiposSelected.forEach(ts => {
            if (!GENERAL_TYPES_NORMALIZED.includes(normalizeString(ts)) && !s.includes(ts)) {
                s.push(ts);
            }
        });

        return { generalTipos: g, subTipos: s };
    }, [tipos, availableTipos, tiposSelected]);

    const filteredSubTipos = useMemo(() => {
        return subTipos.filter(t => normalizeString(t).includes(normalizeString(tiposSearch)));
    }, [subTipos, tiposSearch]);

    const visibleSubTipos = showAllTipos || tiposSearch ? filteredSubTipos : filteredSubTipos.slice(0, 8);

    const actualMin = costeMin ?? 0;
    const actualMax = costeMax ?? maxCostAvailable;

    return (
        <aside className="cardsFilters">
            <div className="cardsFilters__section">
                <label className="cardsFilters__label">Buscar</label>
                <input
                    className="cardsFilters__input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nombre o efecto..."
                />
            </div>

            <div className="cardsFilters__section">
                <label className="cardsFilters__label">Tipo General</label>
                <div className="cardsFilters__chips">
                    {generalTipos.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`chip ${tiposSelected.includes(t) ? 'is-active' : ''}`}
                            onClick={() => toggleTipo(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {subTipos.length > 0 && (
                <div className="cardsFilters__section">
                    <label className="cardsFilters__label">Subtipos</label>
                    <input
                        className="cardsFilters__input cardsFilters__input--search"
                        placeholder="Buscar subtipo..."
                        value={tiposSearch}
                        onChange={(e) => setTiposSearch(e.target.value)}
                    />
                    <div className="cardsFilters__chips">
                        {visibleSubTipos.map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={`chip ${tiposSelected.includes(t) ? 'is-active' : ''}`}
                                onClick={() => toggleTipo(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    {!tiposSearch && subTipos.length > 8 && (
                        <button type="button" className="cardsFilters__moreBtn link link--bold" onClick={() => setShowAllTipos(!showAllTipos)}>
                            {showAllTipos ? 'Ver menos...' : `Ver ${subTipos.length - 8} más...`}
                        </button>
                    )}
                </div>
            )}

            <div className="cardsFilters__section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="cardsFilters__label" style={{ marginBottom: 0 }}>Colores</label>
                    {coloresSelected.length > 1 && (
                        <button 
                            className="link link--bold" 
                            style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => setColorMatchMode(colorMatchMode === 'AND' ? 'OR' : 'AND')}
                        >
                            {colorMatchMode === 'AND' ? 'Exigir todos (Y)' : 'Cualquiera (O)'}
                        </button>
                    )}
                </div>
                <div className="cardsFilters__chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {colores.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={`chip-color ${coloresSelected.includes(c) ? 'is-active' : ''}`}
                            onClick={() => toggleColor(c)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: coloresSelected.includes(c) ? '3px solid var(--colors-darkRed)' : '1px solid #ccc',
                                backgroundColor: c,
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                            }}
                            title={getDisplayColorName(c)}
                        >
                        </button>
                    ))}
                </div>
            </div>

            <div className="cardsFilters__section two-column">
                <div>
                    <label className="cardsFilters__label">Expansión</label>
                    <select className="cardsFilters__select" value={expansion || ''} onChange={(e) => setExpansion(e.target.value || null)}>
                        <option value="">Todas</option>
                        {expansions.map((ex) => (
                            <option key={ex} value={ex}>
                                {ex}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="cardsFilters__label">Rareza</label>
                    <select className="cardsFilters__select" value={rareza || ''} onChange={(e) => setRareza(e.target.value || null)}>
                        <option value="">Todas</option>
                        {rarezas.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="cardsFilters__section">
                <label className="cardsFilters__label">Coste (Zeón)</label>
                <div className="cardsFilters__sliderWrapper">
                    <Slider
                        value={[actualMin, actualMax]}
                        onChange={(e, newValue) => {
                            const [min, max] = newValue as number[];
                            setCosteMin(min);
                            setCosteMax(max);
                        }}
                        valueLabelDisplay="auto"
                        min={0}
                        max={maxCostAvailable}
                        sx={{
                            color: 'var(--colors-darkRed)',
                            '& .MuiSlider-thumb': {
                                backgroundColor: 'var(--colors-darkRed)',
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: 'var(--colors-darkRed)',
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: 'var(--colors-darkRed)',
                                opacity: 0.3
                            }
                        }}
                    />
                </div>
                <div className="cardsFilters__costeMobileText">
                    Coste seleccionado: {actualMin} - {actualMax}
                </div>
            </div>

            <div className="cardsFilters__section">
                <label className="cardsFilters__label">Ordenar por</label>
                <select className="cardsFilters__select" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="name_asc">Nombre (A-Z)</option>
                    <option value="cost_asc">Coste (Ascendente)</option>
                    <option value="cost_desc">Coste (Descendente)</option>
                </select>
            </div>

            <div className="cardsFilters__separator"></div>

            <div className="cardsFilters__actions">
                <button className="btn" onClick={onReset} type="button">
                    Limpiar Filtros
                </button>
            </div>
        </aside>
    );
};

export default React.memo(FiltersPanel);
