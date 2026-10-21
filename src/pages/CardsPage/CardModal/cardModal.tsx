import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCoins, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CardDTO } from 'services/cardsService';
import '../cardsPage.scss';

type Props = {
    card: CardDTO;
    onClose: () => void;
    onAddToCart?: (card: CardDTO) => void;
    isBlocked?: (card: CardDTO) => boolean;
    getPrice?: (card: CardDTO) => number | null;
};

const CardModal: React.FC<Props> = ({ card, onClose, onAddToCart, isBlocked, getPrice }) => {
    const blocked = isBlocked?.(card) ?? false;
    const price = getPrice?.(card) ?? null;

    return (
        <div className="modalBackdrop is-open" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <button className="closeBtn" aria-label="Cerrar" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <img src={card.imagen_url || '/images/card-fallback.png'} alt={card.nombre} />
                {onAddToCart && (
                    <button
                        type="button"
                        className={`modalContent__addButton${price === null ? ' modalContent__addButton--blocked' : ''}`}
                        disabled={price === null}
                        onClick={(event) => {
                            onAddToCart(card);
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
                        aria-label={`Añadir ${card.nombre} al pedido`}
                    >
                        <FontAwesomeIcon icon={faCartPlus} />
                        <span>{blocked ? 'Solo en Sobres' : price === null ? 'Sin precio' : `Añadir al pedido · ${price}`}</span>
                        {price !== null && <FontAwesomeIcon icon={faCoins} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(CardModal);
