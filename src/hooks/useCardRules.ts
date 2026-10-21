import { useCallback, useEffect, useState } from 'react';
import { CardDTO } from 'services/cardsService';
import { fetchExpansionsByKey } from 'services/expansionLocks';
import { fetchRarityPricesByKey } from 'services/rarityPrices';
import { CardRulesData, getCardPrice, getCardVisibility, isCardOrderBlocked } from 'services/cardRules';

const emptyRules = (): CardRulesData => ({ expansions: new Map(), rarityPrices: new Map() });

export function useCardRules() {
    const [rules, setRules] = useState<CardRulesData>(emptyRules);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async (force: boolean = false) => {
        try {
            const [expansions, rarityPrices] = await Promise.all([
                fetchExpansionsByKey({ force }),
                fetchRarityPricesByKey({ force }),
            ]);
            setRules({ expansions, rarityPrices });
        } catch (err) {
            console.error('Error cargando reglas de cartas', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const isBlocked = useCallback((card: CardDTO) => isCardOrderBlocked(rules, card), [rules]);
    const getPrice = useCallback((card: CardDTO) => getCardPrice(rules, card), [rules]);
    const getVisibility = useCallback((card: CardDTO) => getCardVisibility(rules, card), [rules]);
    const isVisible = useCallback((card: CardDTO) => getCardVisibility(rules, card) === 'visible', [rules]);

    return { rules, isBlocked, getPrice, getVisibility, isVisible, loading, reload };
}
