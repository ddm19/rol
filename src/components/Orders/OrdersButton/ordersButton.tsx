import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useCardOrderCart } from 'hooks/useCardOrderCart';
import { useCardRules } from 'hooks/useCardRules';
import OrdersModal from '../OrdersModal/ordersModal';
import './ordersButton.scss';

interface OrdersButtonProps {
    variant?: 'navbar' | 'floating' | 'mobile';
}

const OrdersButton: React.FC<OrdersButtonProps> = ({ variant = 'navbar' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { cart } = useCardOrderCart();
    const { getPrice } = useCardRules();
    const cartValue = cart.reduce((total, item) => total + (getPrice(item.card) ?? 0) * item.quantity, 0);

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
                    </button>
                </div>
                <OrdersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
                </button>
                {cart.length > 0 && (
                    <span className="ordersButtonPanel__cartValue" title="Valor del carrito actual">
                        <FontAwesomeIcon icon={faCoins} />
                        {cartValue}
                    </span>
                )}
            </div>
            <OrdersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default React.memo(OrdersButton);
