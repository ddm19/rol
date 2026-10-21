import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCoins, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CardDTO, getCardThumbUrl } from 'services/cardsService';
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
    const fullUrl = card.imagen_url || '/images/card-fallback.png';
    const thumbUrl = getCardThumbUrl(card.imagen_url);
    const [fullLoaded, setFullLoaded] = useState(false);

    useEffect(() => setFullLoaded(false), [fullUrl]);

    return (
        <div className="modalBackdrop is-open" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <button className="closeBtn" aria-label="Cerrar" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className="modalContent__image">
                    {thumbUrl && thumbUrl !== fullUrl && (
                        <img src={thumbUrl} alt="" aria-hidden="true" className="modalContent__placeholder" />
                    )}
                    <img
                        src={fullUrl}
                        alt={card.nombre}
                        className={`modalContent__full${fullLoaded || !thumbUrl || thumbUrl === fullUrl ? ' is-loaded' : ''}`}
                        onLoad={() => setFullLoaded(true)}
                    />
                </div>
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
