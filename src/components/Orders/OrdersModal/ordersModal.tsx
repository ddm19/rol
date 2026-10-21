import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCartShopping, faCoins, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import OrderBoosterTab from '../OrderBoosterTab/orderBoosterTab';
import OrderCardsTab from '../OrderCardsTab/orderCardsTab';
import SendCoinsTab from '../SendCoinsTab/sendCoinsTab';
import CoinsButton from 'components/Coins/CoinsButton/coinsButton';
import './ordersModal.scss';

export type OrdersTab = 'booster' | 'cards' | 'coins';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: OrdersTab;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, initialTab = 'cards' }) => {
    const [activeTab, setActiveTab] = useState<OrdersTab>(initialTab);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    return (
        <div className="ordersModalBackdrop" onClick={onClose}>
            <div className="ordersModal" onClick={(e) => e.stopPropagation()}>
                <div className="ordersModal__header">
                    <h2 className="ordersModal__title">Hacer Pedido de Cartas</h2>
                    <CoinsButton variant="modal" onOpenSend={() => setActiveTab('coins')} />
                    <button
                        className="ordersModal__closeButton"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {!user && (
                    <div className="ordersModal__notLoggedIn">
                        <p>Debes estar logueado para hacer pedidos.</p>
                        <p>Por favor, inicia sesión primero.</p>
                    </div>
                )}

                {user && (
                    <>
                        <div className="ordersModal__tabs">
                            <button
                                className={`ordersModal__tab ${activeTab === 'booster' ? 'is-active' : ''}`}
                                onClick={() => setActiveTab('booster')}
                            >
                                <FontAwesomeIcon icon={faBox} className="ordersModal__tabIcon" />
                                Pedir Sobre
                            </button>
                            <button
                                className={`ordersModal__tab ${activeTab === 'cards' ? 'is-active' : ''}`}
                                onClick={() => setActiveTab('cards')}
                            >
                                <FontAwesomeIcon icon={faCartShopping} className="ordersModal__tabIcon" />
                                Pedir Cartas
                            </button>
                            <button
                                className={`ordersModal__tab ${activeTab === 'coins' ? 'is-active' : ''}`}
                                onClick={() => setActiveTab('coins')}
                            >
                                <FontAwesomeIcon icon={faCoins} className="ordersModal__tabIcon" />
                                Enviar Oro
                            </button>
                        </div>

                        <div className="ordersModal__content">
                            {activeTab === 'booster' && <OrderBoosterTab />}
                            {activeTab === 'cards' && <OrderCardsTab />}
                            {activeTab === 'coins' && <SendCoinsTab />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(OrdersModal);
