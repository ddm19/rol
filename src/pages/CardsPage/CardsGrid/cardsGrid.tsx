import React from 'react';
import './cardsGrid.scss';
import { CardDTO } from 'services/cardsService';

type Props = {
    cards: CardDTO[];
    onSelect?: (url: string) => void;
};

const fallback = '/images/card-fallback.png'; // Update to a working public path if needed

const CardsGrid: React.FC<Props> = ({ cards, onSelect }) => {
    return (
        <div className="cardsGrid">
            {cards.map((c) => (
                <div key={c.id_archivo} className="cardsGrid__card" onClick={() => c.imagen_url && onSelect?.(c.imagen_url)}>
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