import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import './cardsPage.scss';
import Loading from 'components/Loading/Loading';
import FiltersPanel from './FiltersPanel/filtersPanel';
import CardsGrid from './CardsGrid/cardsGrid';
import useCardSearch from 'hooks/useCardSearch';
import { CardDTO, fetchFacets } from 'services/cardsService';
import { useCardOrderCart } from 'hooks/useCardOrderCart';

const CardsPage: React.FC = () => {
    const [facets, setFacets] = useState({
        tipos: [] as string[],
        colores: [] as string[],
        expansions: [] as string[],
        rarezas: [] as string[],
        maxCost: 10
    });
    const [active, setActive] = useState<CardDTO | null>(null);
    const { addCard } = useCardOrderCart();

    const {
        loading,
        results,
        query,
        setQuery,
        tipos,
        setTipos,
        colores,
        setColores,
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
        availableTipos
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
            <div className="cardsPage__header">
                <FiltersPanel
                    tipos={facets.tipos}
                    availableTipos={availableTipos}
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
                    colorMatchMode={colorMatchMode}
                    setColorMatchMode={setColorMatchMode}
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
            </div>

            <div className="cardsPage__content">
                <CardsGrid
                    cards={results}
                    onSelect={(card) => setActive(card)}
                    onAddToCart={addCard}
                />
            </div>

            {active && (
                <div className="modalBackdrop is-open" onClick={() => setActive(null)} role="dialog" aria-modal="true">
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="closeBtn" aria-label="Cerrar" onClick={() => setActive(null)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <img src={active.imagen_url || '/images/card-fallback.png'} alt={active.nombre} />
                        <button
                            type="button"
                            className="modalContent__addButton"
                            onClick={(event) => {
                                addCard(active)
                                const button = event.currentTarget;
                                const originalText = button.innerHTML;
                                button.classList.add('cardsGrid__addButton--bought');
                                button.disabled = true;
                                button.innerHTML = '<span>¡Añadido!</span>';
                                setTimeout(() => {
                                    button.classList.remove('cardsGrid__addButton--bought');
                                    button.disabled = false;
                                    button.innerHTML = originalText;
                                }, 500);
                            }}
                            title="Añadir al pedido"
                            aria-label={`Añadir ${active.nombre} al pedido`}
                        >
                            <FontAwesomeIcon icon={faCartPlus} />
                            <span>Añadir al pedido</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(CardsPage);
