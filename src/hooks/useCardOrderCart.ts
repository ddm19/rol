import { useCallback, useEffect, useMemo, useState } from 'react';
import { CardDTO } from 'services/cardsService';

export type CardOrderCartItem = {
    card: CardDTO;
    quantity: number;
};

const CART_STORAGE_KEY = 'hispania-card-order-cart';
const CART_UPDATED_EVENT = 'hispania-card-order-cart-updated';
const MAX_CARD_QUANTITY = 4;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeCart = (items: CardOrderCartItem[]) => {
    const byId = new Map<string, CardOrderCartItem>();

    items.forEach((item) => {
        if (!item?.card?.id_archivo) return;

        const existing = byId.get(item.card.id_archivo);
        const quantity = Math.min(
            MAX_CARD_QUANTITY,
            Math.max(1, Math.floor(Number(item.quantity) || 1) + (existing?.quantity || 0))
        );

        byId.set(item.card.id_archivo, {
            card: existing?.card || item.card,
            quantity,
        });
    });

    return Array.from(byId.values());
};

const readCart = (): CardOrderCartItem[] => {
    if (!canUseStorage()) return [];

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        return raw ? normalizeCart(JSON.parse(raw) as CardOrderCartItem[]) : [];
    } catch {
        return [];
    }
};

const writeCart = (items: CardOrderCartItem[]) => {
    if (!canUseStorage()) return;

    try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        window.setTimeout(() => window.dispatchEvent(new Event(CART_UPDATED_EVENT)), 0);
    } catch {
        // Ignore storage failures; the in-memory state still keeps the cart usable.
    }
};

export function useCardOrderCart() {
    const [cart, setCart] = useState<CardOrderCartItem[]>(readCart);

    useEffect(() => {
        const syncCart = () => setCart(readCart());

        window.addEventListener('storage', syncCart);
        window.addEventListener(CART_UPDATED_EVENT, syncCart);

        return () => {
            window.removeEventListener('storage', syncCart);
            window.removeEventListener(CART_UPDATED_EVENT, syncCart);
        };
    }, []);

    const updateCart = useCallback((updater: (current: CardOrderCartItem[]) => CardOrderCartItem[]) => {
        setCart((current) => {
            const next = normalizeCart(updater(current));
            writeCart(next);
            return next;
        });
    }, []);

    const addCard = useCallback((card: CardDTO) => {
        updateCart((current) => {
            const existing = current.find((item) => item.card.id_archivo === card.id_archivo);

            if (!existing) {
                return [...current, { card, quantity: 1 }];
            }

            return current.map((item) =>
                item.card.id_archivo === card.id_archivo
                    ? { ...item, quantity: Math.min(MAX_CARD_QUANTITY, item.quantity + 1) }
                    : item
            );
        });
    }, [updateCart]);

    const removeCard = useCallback((cardId: string) => {
        updateCart((current) => current.filter((item) => item.card.id_archivo !== cardId));
    }, [updateCart]);

    const updateQuantity = useCallback((cardId: string, quantity: number) => {
        updateCart((current) => {
            if (quantity <= 0) {
                return current.filter((item) => item.card.id_archivo !== cardId);
            }

            return current.map((item) =>
                item.card.id_archivo === cardId
                    ? { ...item, quantity: Math.min(MAX_CARD_QUANTITY, quantity) }
                    : item
            );
        });
    }, [updateCart]);

    const clearCart = useCallback(() => {
        updateCart(() => []);
    }, [updateCart]);

    const totalQuantity = useMemo(
        () => cart.reduce((total, item) => total + item.quantity, 0),
        [cart]
    );

    return {
        cart,
        totalQuantity,
        addCard,
        removeCard,
        updateQuantity,
        clearCart,
        maxCardQuantity: MAX_CARD_QUANTITY,
    };
}
