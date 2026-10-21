import { CardDTO, CardVisibility, normalizeKey } from './cardsService';
import { ExpansionRecord } from './expansionLocks';
import { rarityPriceKey } from './rarityPrices';

export type CardRulesData = {
    expansions: Map<string, ExpansionRecord>;
    rarityPrices: Map<string, number>;
};

function getExpansion(data: CardRulesData, card: CardDTO): ExpansionRecord | undefined {
    return card.expansion ? data.expansions.get(normalizeKey(card.expansion)) : undefined;
}

export function getCardVisibility(data: CardRulesData, card: CardDTO, now: number = Date.now()): CardVisibility {
    const overrideActive = card.visibility && (!card.reveal_at || new Date(card.reveal_at).getTime() <= now);
    if (overrideActive && card.visibility) return card.visibility;
    return getExpansion(data, card)?.visibility || 'visible';
}

export function isCardOrderBlocked(data: CardRulesData, card: CardDTO): boolean {
    if (card.order_blocked) return true;
    const expansion = getExpansion(data, card);
    if (!expansion) return false;
    if (expansion.order_blocked) return true;
    if (!card.rareza) return false;
    const rareza = normalizeKey(card.rareza);
    return (expansion.blocked || []).some((blocked) => normalizeKey(blocked) === rareza);
}

export function getCardPrice(data: CardRulesData, card: CardDTO): number | null {
    if (isCardOrderBlocked(data, card) || getCardVisibility(data, card) !== 'visible') return null;
    if (card.price != null) return card.price;
    if (!card.rareza) return null;
    const expansionPrice = card.expansion ? data.rarityPrices.get(rarityPriceKey(card.rareza, card.expansion)) : undefined;
    return expansionPrice ?? data.rarityPrices.get(rarityPriceKey(card.rareza)) ?? null;
}
