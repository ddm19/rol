import React, { useEffect, useState } from 'react';
import './cardsPage.scss';
import Loading from 'components/Loading/Loading';
import FiltersPanel from './FiltersPanel/filtersPanel';
import CardsGrid from './CardsGrid/cardsGrid';
import useCardSearch from 'hooks/useCardSearch';
import { fetchFacets } from 'services/cardsService';

const CardsPage: React.FC = () => {
    const [facets, setFacets] = useState({ 
        tipos: [] as string[], 
        colores: [] as string[], 
        expansions: [] as string[], 
        rarezas: [] as string[],
        maxCost: 10 
    });
    const [active, setActive] = useState<string | null>(null);

    const {
        loading,
        results,
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
    } = useCardSearch();

    useEffect(() => {
        (async () => {
            try {
                const f = await fetchFacets();
                setFacets(f as any);
            } catch (err) {
                console.error('Error fetching facets', err);
            }
        })();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="cardsPageRoot">
            <FiltersPanel
                tipos={facets.tipos}
                colores={facets.colores}
                expansions={facets.expansions}
                rarezas={facets.rarezas}
                maxCostAvailable={facets.maxCost}

                query={query}
                setQuery={setQuery}
                tiposSelected={tipos}
                setTiposSelected={setTipos}
                coloresSelected={colores}
                setColoresSelected={setColores}
                expansion={expansion}
                setExpansion={setExpansion}
                rareza={rareza}
                setRareza={setRareza}
                costeMin={costeMin}
                setCosteMin={setCosteMin}
                costeMax={costeMax}
                setCosteMax={setCosteMax}
                sort={sort}
                setSort={setSort}
            />

            <div className="cardsPage__content">
                <CardsGrid cards={results} onSelect={(url) => setActive(url)} />
            </div>

            {active && (
                <div className="modalBackdrop is-open" onClick={() => setActive(null)} role="dialog" aria-modal="true">
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="closeBtn" aria-label="Cerrar" onClick={() => setActive(null)}>
                            ✖
                        </button>
                        <img src={active} alt="" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(CardsPage);