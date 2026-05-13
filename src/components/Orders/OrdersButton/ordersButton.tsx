import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { getWeeklyBoosterCount } from 'services/ordersService';
import OrdersModal from '../OrdersModal/ordersModal';
import './ordersButton.scss';

interface OrdersButtonProps {
    variant?: 'navbar' | 'floating';
    showBadge?: boolean;
}

const OrdersButton: React.FC<OrdersButtonProps> = ({
    variant = 'navbar',
    showBadge = true
}) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [boosterCount, setBoosterCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.id && showBadge) {
            loadBoosterCount();
            const interval = setInterval(loadBoosterCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.id, showBadge]);

    const loadBoosterCount = async () => {
        try {
            setIsLoading(true);
            if (user?.id) {
                const count = await getWeeklyBoosterCount(user.id);
                setBoosterCount(count);
            }
        } catch (err) {
            console.error('Error loading booster count:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'floating') {
        return (
            <>
                <button
                    className="ordersButton ordersButton--floating"
                    onClick={() => setIsModalOpen(true)}
                    title="Hacer pedido de cartas"
                    aria-label="Hacer pedido de cartas"
                >
                    <FontAwesomeIcon icon={faShoppingBag} className="ordersButton__icon" />
                    {showBadge && boosterCount > 0 && (
                        <span className="ordersButton__badge">{boosterCount}/2</span>
                    )}
                </button>
                <OrdersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        );
    }

    return (
        <>
            <button
                className="ordersButton ordersButton--navbar"
                onClick={() => setIsModalOpen(true)}
                title="Hacer pedido de cartas"
                aria-label="Hacer pedido de cartas"
            >
                <FontAwesomeIcon icon={faShoppingBag} className="ordersButton__icon" />
                <span className="ordersButton__text">Pedidos</span>
                {showBadge && boosterCount > 0 && (
                    <span className="ordersButton__badge">{boosterCount}/2</span>
                )}
            </button>
            <OrdersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default React.memo(OrdersButton);
