import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faCheckCircle,
    faExclamationCircle,
    faXmark,
    faMinus,
    faPlus,
    faTrash,
    faCartShopping
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { CardDTO } from 'services/cardsService';
import { createCardOrder, OrderItem } from 'services/ordersService';
import useCardSearch from 'hooks/useCardSearch';
import { useCardOrderCart } from 'hooks/useCardOrderCart';
import './orderCardsTab.scss';

const OrderCardsTab: React.FC = () => {
    const { user } = useAuth();
    const { results: searchResults, query, setQuery } = useCardSearch();
    const {
        cart,
        totalQuantity,
        addCard,
        removeCard,
        updateQuantity,
        clearCart,
        maxCardQuantity
    } = useCardOrderCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const handleSelectCard = (card: CardDTO) => {
        addCard(card);
    };

    const handleRemoveCard = (cardId: string) => {
        removeCard(cardId);
    };

    const handleUpdateQuantity = (cardId: string, quantity: number) => {
        updateQuantity(cardId, quantity);
    };

    const handleOrderCards = async () => {
        try {
            setError(null);
            setSuccess(false);

            if (!user?.id) {
                setError('Debes estar logueado para hacer pedidos');
                return;
            }

            if (cart.length === 0) {
                setError('Debes seleccionar al menos una carta');
                return;
            }

            setLoading(true);

            const items: OrderItem[] = cart.map(sc => ({
                quantity: sc.quantity,
                card_id_archivo: sc.card.id_archivo,
            }));

            await createCardOrder(user.id, items);

            setSuccess(true);
            setError(null);
            clearCart();
            setQuery('');

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error creating card order:', err);
            setError('Error al crear la orden. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="orderCardsTab">
                <div className="orderCardsTab__message">
                    Debes estar logueado para hacer pedidos
                </div>
            </div>
        );
    }

    return (
        <div className="orderCardsTab">
            <div className="orderCardsTab__container">
                <div className="orderCardsTab__searchSection">
                    <div className="orderCardsTab__searchBox">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="orderCardsTab__searchIcon" />
                        <input
                            type="text"
                            placeholder="Busca cartas para añadir por nombre..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSearchResults(true);
                            }}
                            className="orderCardsTab__searchInput"
                        />
                        {query && (
                            <button
                                className="orderCardsTab__clearButton"
                                onClick={() => {
                                    setQuery('');
                                    setShowSearchResults(false);
                                }}
                                aria-label="Limpiar búsqueda"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>

                    {showSearchResults && query && searchResults.length > 0 && (
                        <div className="orderCardsTab__searchResults">
                            {searchResults.slice(0, 10).map(card => (
                                <button
                                    key={card.id_archivo}
                                    className="orderCardsTab__resultItem"
                                    onClick={() => {
                                        handleSelectCard(card);
                                        setShowSearchResults(false);
                                    }}
                                >
                                    <span className="orderCardsTab__resultName">{card.nombre}</span>
                                    <span className="orderCardsTab__resultExpansion">{card.expansion}</span>
                                    <FontAwesomeIcon icon={faPlus} className="orderCardsTab__resultAddIcon" />
                                </button>
                            ))}
                        </div>
                    )}

                    {showSearchResults && query && searchResults.length === 0 && (
                        <div className="orderCardsTab__noResults">
                            No se encontraron cartas
                        </div>
                    )}
                </div>
                <div className="orderCardsTab__cartHeader">
                    <div className="orderCardsTab__cartIcon">
                        <FontAwesomeIcon icon={faCartShopping} />
                    </div>
                    <div className="orderCardsTab__cartSummary">
                        <h3 className="orderCardsTab__cartTitle">Carrito de cartas</h3>
                        <span className="orderCardsTab__cartCount">
                            {totalQuantity} carta{totalQuantity !== 1 ? 's' : ''} en el pedido
                        </span>
                    </div>
                    {cart.length > 0 && (
                        <button
                            type="button"
                            className="orderCardsTab__clearCartButton"
                            onClick={clearCart}
                        >
                            Vaciar
                        </button>
                    )}
                </div>



                <div className="orderCardsTab__selectedSection">
                    <h3 className="orderCardsTab__sectionTitle">
                        Pedido actual ({cart.length})
                    </h3>

                    {cart.length === 0 ? (
                        <div className="orderCardsTab__empty">
                            El carrito esta vacio. Anade cartas desde la pestana de cartas o desde el buscador.
                        </div>
                    ) : (
                        <div className="orderCardsTab__selectedList">
                            {cart.map(({ card, quantity }) => (
                                <div key={card.id_archivo} className="orderCardsTab__selectedCard">
                                    <div className="orderCardsTab__cardImage">
                                        <img
                                            src={card.imagen_url || '/images/card-fallback.png'}
                                            alt={card.nombre}
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/card-fallback.png';
                                            }}
                                        />
                                    </div>

                                    <div className="orderCardsTab__cardInfo">
                                        <div className="orderCardsTab__cardName">{card.nombre}</div>
                                        <div className="orderCardsTab__cardExpansion">{card.expansion}</div>
                                    </div>

                                    <div className="orderCardsTab__quantityControl">
                                        <button
                                            className="orderCardsTab__quantityBtn"
                                            onClick={() => handleUpdateQuantity(card.id_archivo, quantity - 1)}
                                            aria-label="Disminuir cantidad"
                                        >
                                            <FontAwesomeIcon icon={faMinus} />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={maxCardQuantity}
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                handleUpdateQuantity(card.id_archivo, val);
                                            }}
                                            className="orderCardsTab__quantityInput"
                                        />
                                        <button
                                            className="orderCardsTab__quantityBtn"
                                            onClick={() => handleUpdateQuantity(card.id_archivo, quantity + 1)}
                                            disabled={quantity >= maxCardQuantity}
                                            aria-label="Aumentar cantidad"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>

                                    <button
                                        className="orderCardsTab__removeButton"
                                        onClick={() => handleRemoveCard(card.id_archivo)}
                                        title="Eliminar carta"
                                        aria-label="Eliminar carta"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="orderCardsTab__actionSection">
                    {error && (
                        <div className="orderCardsTab__error">
                            <FontAwesomeIcon icon={faExclamationCircle} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="orderCardsTab__success">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Orden de cartas enviada exitosamente. Revisa tu correo.
                        </div>
                    )}

                    <button
                        className="orderCardsTab__button"
                        onClick={handleOrderCards}
                        disabled={loading || cart.length === 0}
                    >
                        {loading ? 'Procesando...' : `Pedir ${totalQuantity} carta${totalQuantity !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OrderCardsTab);
