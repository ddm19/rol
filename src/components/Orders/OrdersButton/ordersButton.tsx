import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { getWeeklyBoosterCount, getWeeklyLimitResetDate } from 'services/ordersService';
import OrdersModal from '../OrdersModal/ordersModal';
import './ordersButton.scss';

interface OrdersButtonProps {
    variant?: 'navbar' | 'floating' | 'mobile';
    showBadge?: boolean;
}

const WEEKLY_LIMIT = 2;
const NEAR_UNLOCK_THRESHOLD_MS = 60 * 60 * 1000;

const formatTimeUntilReset = (resetDate: Date | null) => {
    if (!resetDate) return '';

    const diff = resetDate.getTime() - Date.now();
    if (diff <= 0) return 'Disponible';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

const OrdersButton: React.FC<OrdersButtonProps> = ({
    variant = 'navbar',
    showBadge = true
}) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [boosterCount, setBoosterCount] = useState(0);
    const [resetDate, setResetDate] = useState<Date | null>(null);
    const [timeUntilReset, setTimeUntilReset] = useState('');

    const loadBoosterStatus = useCallback(async () => {
        try {
            if (user?.id) {
                const [count, reset] = await Promise.all([
                    getWeeklyBoosterCount(user.id),
                    getWeeklyLimitResetDate(user.id),
                ]);
                setBoosterCount(count);
                setResetDate(reset);
                setTimeUntilReset(formatTimeUntilReset(reset));
            }
        } catch (err) {
            console.error('Error loading booster count:', err);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id && showBadge) {
            loadBoosterStatus();
            const interval = window.setInterval(loadBoosterStatus, 30000);
            return () => window.clearInterval(interval);
        }

        setBoosterCount(0);
        setResetDate(null);
        setTimeUntilReset('');
    }, [loadBoosterStatus, showBadge, user?.id]);

    useEffect(() => {
        setTimeUntilReset(formatTimeUntilReset(resetDate));

        if (!resetDate) return;

        const interval = window.setInterval(() => {
            setTimeUntilReset(formatTimeUntilReset(resetDate));

            if (resetDate.getTime() <= Date.now()) {
                loadBoosterStatus();
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [loadBoosterStatus, resetDate]);

    const isLocked = boosterCount >= WEEKLY_LIMIT;
    const timeToUnlock = resetDate ? resetDate.getTime() - Date.now() : Number.POSITIVE_INFINITY;
    const isNearUnlock = isLocked && timeToUnlock > 0 && timeToUnlock <= NEAR_UNLOCK_THRESHOLD_MS;
    const shouldShowCounter = showBadge && user?.id && variant !== 'mobile';
    const counterText = isLocked
        ? `Nuevo sobre en ${timeUntilReset || 'pronto'}`
        : `Disponible ${WEEKLY_LIMIT - boosterCount}/${WEEKLY_LIMIT}`;
    const handleCloseModal = () => {
        setIsModalOpen(false);
        loadBoosterStatus();
    };

    if (variant === 'floating') {
        return (
            <>
                <div className="ordersButtonPanel ordersButtonPanel--floating">
                    <button
                        className="ordersButton ordersButton--floating"
                        onClick={() => setIsModalOpen(true)}
                        title="Hacer pedido de cartas"
                        aria-label="Hacer pedido de cartas"
                    >
                        <FontAwesomeIcon icon={faShoppingBag} className="ordersButton__icon" />
                        {showBadge && boosterCount > 0 && (
                            <span className="ordersButton__badge">{boosterCount}/{WEEKLY_LIMIT}</span>
                        )}
                    </button>
                    {shouldShowCounter && (
                        <span
                            className={`ordersButtonPanel__counter ${isLocked ? 'is-locked' : 'is-ready'} ${isNearUnlock ? 'is-nearUnlock' : ''}`}
                            aria-live="polite"
                        >
                            {counterText}
                        </span>
                    )}
                </div>
                <OrdersModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </>
        );
    }

    return (
        <>
            <div className="ordersButtonPanel ordersButtonPanel--navbar">
                <button
                    className="ordersButton ordersButton--navbar"
                    onClick={() => setIsModalOpen(true)}
                    title="Hacer pedido de cartas"
                    aria-label="Hacer pedido de cartas"
                >
                    <FontAwesomeIcon icon={faShoppingBag} className="ordersButton__icon" />
                    <span className="ordersButton__text">{variant !== 'mobile' ? 'Pedidos' : ''}</span>
                    {showBadge && boosterCount > 0 && (
                        <span className="ordersButton__badge">{boosterCount}/{WEEKLY_LIMIT}</span>
                    )}
                </button>
                {shouldShowCounter && (
                    <span
                        className={`ordersButtonPanel__counter ${isLocked ? 'is-locked' : 'is-ready'} ${isNearUnlock ? 'is-nearUnlock' : ''}`}
                        aria-live="polite"
                    >
                        {counterText}
                    </span>
                )}
            </div>
            <OrdersModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
};

export default React.memo(OrdersButton);
