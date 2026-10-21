import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from 'hooks/useAuth';
import { claimCoins, CoinWallet, fetchMyWallet, getNextClaimDate } from 'services/coinsService';
import { fetchRohSettings, RohSettings } from 'services/rohSettings';

const WALLET_UPDATED_EVENT = 'hispania-coins-wallet-updated';

const publishWallet = (wallet: CoinWallet) => {
    window.dispatchEvent(new CustomEvent<CoinWallet>(WALLET_UPDATED_EVENT, { detail: wallet }));
};

export async function refreshCoins(userId: string) {
    publishWallet(await fetchMyWallet(userId));
}

export function useCoins() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<CoinWallet | null>(null);
    const [settings, setSettings] = useState<RohSettings | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    const load = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [loadedWallet, loadedSettings] = await Promise.all([
                fetchMyWallet(user.id),
                fetchRohSettings(),
            ]);
            setWallet(loadedWallet);
            setSettings(loadedSettings);
        } catch (err) {
            console.error('Error cargando monedas', err);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setWallet(null);
            return;
        }
        load();
    }, [load, user?.id]);

    useEffect(() => {
        const syncWallet = (event: Event) => setWallet((event as CustomEvent<CoinWallet>).detail);
        window.addEventListener(WALLET_UPDATED_EVENT, syncWallet);
        return () => window.removeEventListener(WALLET_UPDATED_EVENT, syncWallet);
    }, []);

    const nextClaimAt = useMemo(
        () => (settings ? getNextClaimDate(wallet, settings.claim_interval_days) : null),
        [settings, wallet]
    );

    const onClaimAvailable = useCallback(() => setNow(Date.now()), []);
    const canClaim = !!wallet && !!settings && (!nextClaimAt || nextClaimAt.getTime() <= now);

    const claim = useCallback(async () => {
        setClaiming(true);
        try {
            const updated = await claimCoins();
            publishWallet(updated);
            setNow(Date.now());
            return updated;
        } finally {
            setClaiming(false);
        }
    }, []);

    return {
        isLoggedIn: !!user?.id,
        balance: wallet?.balance ?? 0,
        coinsPerClaim: settings?.coins_per_claim ?? 0,
        nextClaimAt,
        canClaim,
        claiming,
        claim,
        onClaimAvailable,
    };
}
