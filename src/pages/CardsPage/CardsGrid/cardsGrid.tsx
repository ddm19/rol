import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import './cardsGrid.scss';
import { CardDTO } from 'services/cardsService';

type Props = {
    cards: CardDTO[];
    onSelect?: (card: CardDTO) => void;
    onAddToCart?: (card: CardDTO) => void;
};

const fallback = '/images/card-fallback.png'; // Update to a working public path if needed

const CardsGrid: React.FC<Props> = ({ cards, onSelect, onAddToCart }) => {
    return (
        <div className="cardsGrid">
            {cards.map((c) => (
                <div key={c.id_archivo} className="cardsGrid__card" onClick={() => c.imagen_url && onSelect?.(c)}>
                    <div className="cardsGrid__imageWrapper">
                        <img
                            src={c.imagen_url || fallback}
                            alt={c.nombre}
                            onError={(e) => {
                                const t = e.currentTarget;
                                if (t.src !== fallback) t.src = fallback;
                            }}
                        />
                    </div>
                    <div className="cardsGrid__meta">
                        <div className="cardsGrid__title">
                            <span className="cardsGrid__name">{c.nombre}</span>
                        </div>
                        {onAddToCart && (
                            <button
                                type="button"
                                className="cardsGrid__addButton"
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
                                <span>Añadir</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {cards.length === 0 && (
                <div className="cardsGrid__empty">
                    No se encontraron cartas con estos filtros.
                </div>
            )}
        </div>
    );
};

export default React.memo(CardsGrid);
