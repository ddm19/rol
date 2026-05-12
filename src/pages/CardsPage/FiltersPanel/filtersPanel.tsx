import React, { useMemo, useState } from 'react';
import Slider from '@mui/material/Slider';
import './filtersPanel.scss';

type Props = {
    // facets to populate controls
    tipos: string[];
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

const FiltersPanel: React.FC<Props> = (props) => {
    const {
        tipos,
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
        setExpansion(null);
        setRareza(null);
        setCosteMin(null);
        setCosteMax(null);
        setSort('name_asc');
        setTiposSearch('');
        setShowAllTipos(false);
    };

    const filteredTipos = useMemo(() => {
        return tipos.filter(t => t.toLowerCase().includes(tiposSearch.toLowerCase()));
    }, [tipos, tiposSearch]);

    const visibleTipos = showAllTipos || tiposSearch ? filteredTipos : filteredTipos.slice(0, 8);

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
                <label className="cardsFilters__label">Tipos</label>
                <input
                    className="cardsFilters__input cardsFilters__input--search"
                    placeholder="Buscar tipo..."
                    value={tiposSearch}
                    onChange={(e) => setTiposSearch(e.target.value)}
                />
                <div className="cardsFilters__chips">
                    {visibleTipos.map((t) => (
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
                {!tiposSearch && tipos.length > 8 && (
                    <button type="button" className="cardsFilters__moreBtn link link--bold" onClick={() => setShowAllTipos(!showAllTipos)}>
                        {showAllTipos ? 'Ver menos...' : `Ver ${tipos.length - 8} más...`}
                    </button>
                )}
            </div>

            <div className="cardsFilters__section">
                <label className="cardsFilters__label">Colores</label>
                <div className="cardsFilters__chips">
                    {colores.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={`chip ${coloresSelected.includes(c) ? 'is-active' : ''}`}
                            onClick={() => toggleColor(c)}
                        >
                            {c}
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