import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { useCoins } from 'hooks/useCoins';
import { useCountdown } from 'hooks/useCountdown';
import OrdersModal from 'components/Orders/OrdersModal/ordersModal';
import './coinsButton.scss';

const NEAR_CLAIM_THRESHOLD_MS = 60 * 60 * 1000;

interface CoinsButtonProps {
    variant?: 'navbar' | 'popup' | 'modal';
    onOpenSend?: () => void;
}

const CoinsButton: React.FC<CoinsButtonProps> = ({ variant = 'navbar', onOpenSend }) => {
    const { isLoggedIn, balance, coinsPerClaim, nextClaimAt, canClaim, claiming, claim, onClaimAvailable } = useCoins();
    const timeLeft = useCountdown(canClaim ? null : nextClaimAt, onClaimAvailable);
    const [burstKey, setBurstKey] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isSendOpen, setIsSendOpen] = useState(false);

    if (!isLoggedIn) return null;

    const timeToClaim = nextClaimAt ? nextClaimAt.getTime() - Date.now() : Number.POSITIVE_INFINITY;
    const isNearClaim = !canClaim && timeToClaim > 0 && timeToClaim <= NEAR_CLAIM_THRESHOLD_MS;

    const handleClaim = async () => {
        if (!canClaim || claiming) return;
        try {
            setError(null);
            await claim();
            setBurstKey((key) => key + 1);
        } catch (err) {
            console.error('Error reclamando monedas', err);
            setError('No se pudieron reclamar las monedas');
        }
    };

    const handleOpenSend = () => {
        if (onOpenSend) onOpenSend();
        else setIsSendOpen(true);
    };

    return (
        <div className={`coinsButton coinsButton--${variant}`}>
            <button
                type="button"
                className={`coinsButton__main${canClaim ? ' is-claimable' : ''}`}
                onClick={canClaim ? handleClaim : handleOpenSend}
                disabled={claiming}
                title={canClaim ? `Reclamar ${coinsPerClaim} monedas` : 'Enviar oro'}
                aria-label={canClaim ? `Reclamar ${coinsPerClaim} monedas de oro` : `${balance} monedas de oro, enviar oro`}
            >
                <span className="coinsButton__coin">
                    <FontAwesomeIcon icon={faCoins} />
                    {canClaim && <span className="coinsButton__badge">+{coinsPerClaim}</span>}
                </span>
                <span key={`balance-${burstKey}`} className={`coinsButton__balance${burstKey > 0 ? ' is-bumped' : ''}`}>
                    {balance}
                </span>
                {burstKey > 0 && (
                    <span key={`burst-${burstKey}`} className="coinsButton__burst" aria-hidden="true">
                        +{coinsPerClaim}
                    </span>
                )}
            </button>
            {!canClaim && timeLeft && (
                <span className={`coinsButton__next${isNearClaim ? ' is-nearClaim' : ''}`} aria-live="polite">
                    Más oro en {timeLeft}
                </span>
            )}
            {error && <span className="coinsButton__error">{error}</span>}
            {!onOpenSend && createPortal(
                <OrdersModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} initialTab="coins" />,
                document.body
            )}
        </div>
    );
};

export default React.memo(CoinsButton);
