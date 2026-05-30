import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faCheckCircle,
    faExclamationCircle,
    faXmark,
    faMinus,
    faPlus,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { CardDTO, fetchAllCards } from 'services/cardsService';
import { createCardOrder, OrderItem } from 'services/ordersService';
import useCardSearch from 'hooks/useCardSearch';
import './orderCardsTab.scss';

type SelectedCard = {
    card: CardDTO;
    quantity: number;
};

const OrderCardsTab: React.FC = () => {
    const { user } = useAuth();
    const { results: searchResults, query, setQuery } = useCardSearch();
    const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const handleSelectCard = (card: CardDTO) => {
        const existing = selectedCards.find(sc => sc.card.id_archivo === card.id_archivo);

        if (existing) {
            if (existing.quantity < 4) {
                setSelectedCards(
                    selectedCards.map(sc =>
                        sc.card.id_archivo === card.id_archivo
                            ? { ...sc, quantity: sc.quantity + 1 }
                            : sc
                    )
                );
            }
        } else {
            setSelectedCards([...selectedCards, { card, quantity: 1 }]);
        }
    };

    const handleRemoveCard = (cardId: string) => {
        setSelectedCards(selectedCards.filter(sc => sc.card.id_archivo !== cardId));
    };

    const handleUpdateQuantity = (cardId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveCard(cardId);
        } else if (quantity <= 4) {
            setSelectedCards(
                selectedCards.map(sc =>
                    sc.card.id_archivo === cardId
                        ? { ...sc, quantity }
                        : sc
                )
            );
        }
    };

    const handleOrderCards = async () => {
        try {
            setError(null);
            setSuccess(false);

            if (!user?.id) {
                setError('Debes estar logueado para hacer pedidos');
                return;
            }

            if (selectedCards.length === 0) {
                setError('Debes seleccionar al menos una carta');
                return;
            }

            setLoading(true);

            const items: OrderItem[] = selectedCards.map(sc => ({
                quantity: sc.quantity,
                card_id_archivo: sc.card.id_archivo,
            }));

            await createCardOrder(user.id, items);

            setSuccess(true);
            setError(null);
            setSelectedCards([]);
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
                            placeholder="Busca cartas por nombre..."
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

                <div className="orderCardsTab__selectedSection">
                    <h3 className="orderCardsTab__sectionTitle">
                        Cartas seleccionadas ({selectedCards.length})
                    </h3>

                    {selectedCards.length === 0 ? (
                        <div className="orderCardsTab__empty">
                            Selecciona cartas del buscador de arriba para agregarlas a tu pedido
                        </div>
                    ) : (
                        <div className="orderCardsTab__selectedList">
                            {selectedCards.map(({ card, quantity }) => (
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
                                            max="4"
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
                                            disabled={quantity >= 4}
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

                {/* Sección de acciones */}
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
                        disabled={loading || selectedCards.length === 0}
                    >
                        {loading ? 'Procesando...' : `Pedir ${selectedCards.length} carta${selectedCards.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OrderCardsTab);
