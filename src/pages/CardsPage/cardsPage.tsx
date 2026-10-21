import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEye } from '@fortawesome/free-solid-svg-icons';
import './cardsPage.scss';
import Loading from 'components/Loading/Loading';
import FiltersPanel from './FiltersPanel/filtersPanel';
import CardsGrid from './CardsGrid/cardsGrid';
import CardModal from './CardModal/cardModal';
import useCardSearch from 'hooks/useCardSearch';
import { CardDTO, fetchFacets } from 'services/cardsService';
import { useCardOrderCart } from 'hooks/useCardOrderCart';
import { useCardRules } from 'hooks/useCardRules';
import { fetchRohSettings, RohSettings } from 'services/rohSettings';

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
    const { isBlocked, isVisible, getPrice, loading: rulesLoading } = useCardRules();
    const [settings, setSettings] = useState<RohSettings | null>(null);

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
        expansions: expansionsSelected,
        setExpansions: setExpansionsSelected,
        rarezas: rarezasSelected,
        setRarezas: setRarezasSelected,
        costeMin,
        setCosteMin,
        costeMax,
        setCosteMax,
        sort,
        setSort,
        availableTipos
    } = useCardSearch();

    useEffect(() => {
        if (rulesLoading) return;
        (async () => {
            try {
                const f = await fetchFacets(isVisible);
                setFacets(f as any);
            } catch (err) {
                console.error('Error fetching facets', err);
            }
        })();
    }, [rulesLoading, isVisible]);

    useEffect(() => {
        fetchRohSettings()
            .then(setSettings)
            .catch((err) => console.error('Error fetching ROH settings', err));
    }, []);

    if (loading || rulesLoading) return <Loading />;

    const visibleResults = results.filter(isVisible);

    return (
        <div className="cardsPageRoot">
            {settings?.spoiler_expansion && (
                <Link to="/Cards/Spoilers" className="cardsPage__spoilersLink">
                    <FontAwesomeIcon icon={faEye} />
                    <span>
                        Spoilers de <strong>{settings.spoiler_expansion}</strong> disponibles
                    </span>
                    <span className="cardsPage__spoilersCta">
                        Ver spoilers
                        <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                </Link>
            )}

            <div className="cardsPage__catalog">
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
                        expansionsSelected={expansionsSelected}
                        setExpansionsSelected={setExpansionsSelected}
                        rarezasSelected={rarezasSelected}
                        setRarezasSelected={setRarezasSelected}
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
                        cards={visibleResults}
                        onSelect={(card) => setActive(card)}
                        onAddToCart={(card) => { if (getPrice(card) !== null) addCard(card); }}
                        isBlocked={isBlocked}
                        getPrice={getPrice}
                    />
                </div>
            </div>

            {active && (
                <CardModal
                    card={active}
                    onClose={() => setActive(null)}
                    onAddToCart={addCard}
                    isBlocked={isBlocked}
                    getPrice={getPrice}
                />
            )}
        </div>
    );
};

export default React.memo(CardsPage);
