import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCoins } from '@fortawesome/free-solid-svg-icons';
import './cardsGrid.scss';
import { CardDTO } from 'services/cardsService';

type Props = {
    cards: CardDTO[];
    onSelect?: (card: CardDTO) => void;
    onAddToCart?: (card: CardDTO) => void;
    isBlocked?: (card: CardDTO) => boolean;
    getPrice?: (card: CardDTO) => number | null;
    isNew?: (card: CardDTO) => boolean;
};

const fallback = '/images/card-fallback.png'; // Update to a working public path if needed

const CardsGrid: React.FC<Props> = ({ cards, onSelect, onAddToCart, isBlocked, getPrice, isNew }) => {
    return (
        <div className="cardsGrid">
            {cards.map((c) => {
                const blocked = isBlocked?.(c) ?? false;
                const price = blocked ? null : getPrice?.(c) ?? null;
                const unavailable = blocked || price === null;
                return (
                    <div key={c.id_archivo} className="cardsGrid__card" onClick={() => c.imagen_url && onSelect?.(c)}>
                        <div className="cardsGrid__imageWrapper">
                            {isNew?.(c) && <span className="cardsGrid__newBadge">Nueva</span>}
                            <img
                                src={c.imagen_url || fallback}
                                alt={c.nombre}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    const t = e.currentTarget;
                                    if (t.src !== fallback) t.src = fallback;
                                }}
                            />
                        </div>
                        <div className="cardsGrid__meta">
                            <div className="cardsGrid__title">
                                <span className="cardsGrid__name">{c.nombre}</span>
                                {price !== null && (
                                    <span className="cardsGrid__price">
                                        <FontAwesomeIcon icon={faCoins} />
                                        {price}
                                    </span>
                                )}
                            </div>
                            {onAddToCart && (
                                <button
                                    type="button"
                                    className={`cardsGrid__addButton${unavailable ? ' cardsGrid__addButton--blocked' : ''}`}
                                    disabled={unavailable}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onAddToCart(c);
                                        const button = event.currentTarget;
                                        const originalText = button.innerHTML;
                                        button.classList.add('cardsGrid__addButton--bought');
                                        button.disabled = true;
                                        button.innerHTML = '<span>¡Añadido!</span>';
                                        setTimeout(() => {
                                            button.classList.remove('cardsGrid__addButton--bought');
                                            button.disabled = false;
                                            button.innerHTML = originalText;
                                        }, 500);
                                    }}
                                    title="Añadir al pedido"
                                    aria-label={`Añadir ${c.nombre} al pedido`}
                                >
                                    <FontAwesomeIcon icon={faCartPlus} />
                                    <span>{blocked ? 'Solo en Sobres' : price === null ? 'Sin precio' : 'Añadir'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            {cards.length === 0 && (
                <div className="cardsGrid__empty">
                    No se encontraron cartas con estos filtros.
                </div>
            )}
        </div>
    );
};

export default React.memo(CardsGrid);
