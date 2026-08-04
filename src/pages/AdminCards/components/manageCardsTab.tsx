import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import useCardSearch from 'hooks/useCardSearch';
import { CardDTO } from 'services/cardsService';
import SingleCardForm from './singleCardForm';

const ManageCardsTab: React.FC = () => {
    const { results, loading, query, setQuery, refetch } = useCardSearch();
    const [editing, setEditing] = useState<CardDTO | null>(null);

    if (editing) {
        return (
            <div>
                <button type="button" className="adminCardsPage__back adminCardManage__backButton" onClick={() => setEditing(null)}>
                    ← Volver al listado
                </button>
                <SingleCardForm
                    initialCard={editing}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        refetch();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="adminCardManage">
            <div className="adminCardForm__group">
                <label htmlFor="manage-search">Buscar carta</label>
                <input
                    id="manage-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nombre o efecto..."
                />
            </div>

            {loading ? (
                <div className="adminCardManage__loading">Cargando cartas...</div>
            ) : (
                <>
                    <div className="adminCardManage__count">{results.length} cartas</div>
                    <div className="adminCardManage__list">
                        {results.map((card) => (
                            <button
                                type="button"
                                key={card.id_archivo}
                                className="adminCardManage__row"
                                onClick={() => setEditing(card)}
                            >
                                <div className="adminCardManage__thumb">
                                    {card.imagen_url ? (
                                        <img src={card.imagen_url} alt={card.nombre} />
                                    ) : (
                                        <span>Sin imagen</span>
                                    )}
                                </div>
                                <div className="adminCardManage__info">
                                    <span className="adminCardManage__name">{card.nombre}</span>
                                    <span className="adminCardManage__meta">
                                        {card.expansion || 'Sin expansión'} · Coste {card.coste ?? '?'}
                                        {card.types.length > 0 ? ` · ${card.types.join(', ')}` : ''}
                                    </span>
                                </div>
                                <FontAwesomeIcon icon={faPen} className="adminCardManage__editIcon" />
                            </button>
                        ))}
                        {results.length === 0 && <div className="adminCardManage__empty">No se encontraron cartas.</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageCardsTab;
