import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faChevronDown, faChevronRight, faCoins, faGavel, faHeart, faSkull } from '@fortawesome/free-solid-svg-icons';
import useCardSearch, { SortOption } from 'hooks/useCardSearch';
import SingleCardForm from './singleCardForm';

const NEUTRAL_COLOR = 'var(--colors-border)';

const ManageCardsTab: React.FC = () => {
    const { results, all, loading, query, setQuery, expansions, setExpansions, sort, setSort, refetch } = useCardSearch();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const distinctExpansions = useMemo(() => {
        const set = new Set<string>();
        all.forEach((c) => { if (c.expansion) set.add(c.expansion); });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [all]);

    const toggle = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="adminCardManage">
            <div className="adminCardManage__toolbar">
                <div className="adminCardForm__group adminCardManage__toolbarSearch">
                    <label htmlFor="manage-search">Buscar</label>
                    <input
                        id="manage-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nombre o efecto..."
                    />
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="manage-expansion">Expansión</label>
                    <select
                        id="manage-expansion"
                        value={expansions[0] || ''}
                        onChange={(e) => setExpansions(e.target.value ? [e.target.value] : [])}
                    >
                        <option value="">Todas</option>
                        {distinctExpansions.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="manage-sort">Ordenar por</label>
                    <select id="manage-sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                        <option value="name_asc">Nombre (A-Z)</option>
                        <option value="expansion_asc">Expansión</option>
                        <option value="cost_asc">Coste ascendente</option>
                        <option value="cost_desc">Coste descendente</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="adminCardManage__loading">Cargando cartas...</div>
            ) : (
                <>
                    <div className="adminCardManage__count">{results.length} cartas</div>
                    <div className="adminCardManage__list">
                        {results.map((card) => {
                            const isOpen = expandedIds.has(card.id_archivo);
                            const c1 = card.color || NEUTRAL_COLOR;
                            const c2 = card.color2 || card.color || NEUTRAL_COLOR;
                            const stats = card.stats;
                            const hasStats = !!stats && (stats.ataque != null || stats.vida != null || stats.dano_purga != null);

                            return (
                                <div key={card.id_archivo} className={`adminCardManage__item${isOpen ? ' is-expanded' : ''}`}>
                                    <button
                                        type="button"
                                        className="adminCardManage__tile"
                                        onClick={() => toggle(card.id_archivo)}
                                        aria-expanded={isOpen}
                                    >
                                        <div
                                            className="adminCardManage__colorBar"
                                            style={{ background: `linear-gradient(90deg, ${c1} 50%, ${c2} 50%)` }}
                                        />
                                        <div className="adminCardManage__tileBody">
                                            <div className="adminCardManage__thumb">
                                                {card.imagen_url ? (
                                                    <img src={card.imagen_url} alt={card.nombre} />
                                                ) : (
                                                    <span>Sin imagen</span>
                                                )}
                                            </div>

                                            <div className="adminCardManage__info">
                                                <div className="adminCardManage__nameRow">
                                                    <span className="adminCardManage__name">{card.nombre}</span>
                                                    <FontAwesomeIcon
                                                        icon={isOpen ? faChevronDown : faChevronRight}
                                                        className="adminCardManage__chevron"
                                                    />
                                                </div>

                                                <div className="adminCardManage__badges">
                                                    <span className="adminCardManage__badge adminCardManage__badge--cost" title="Coste">
                                                        <FontAwesomeIcon icon={faCoins} />{card.coste ?? '—'}
                                                    </span>
                                                    {card.iniciativa && (
                                                        <span className="adminCardManage__badge adminCardManage__badge--init" title="Iniciativa">
                                                            <FontAwesomeIcon icon={faBolt} />{card.iniciativa}
                                                        </span>
                                                    )}
                                                    {hasStats && (
                                                        <>
                                                            <span className="adminCardManage__badge adminCardManage__badge--atk" title="Ataque">
                                                                <FontAwesomeIcon icon={faGavel} />{stats!.ataque ?? 0}
                                                            </span>
                                                            <span className="adminCardManage__badge adminCardManage__badge--life" title="Vida">
                                                                <FontAwesomeIcon icon={faHeart} />{stats!.vida ?? 0}
                                                            </span>
                                                            <span className="adminCardManage__badge adminCardManage__badge--purge" title="Purgar">
                                                                <FontAwesomeIcon icon={faSkull} />{stats!.dano_purga ?? 0}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {(card.expansion || card.types.length > 0) && (
                                                    <div className="adminCardManage__tags">
                                                        {card.expansion && (
                                                            <span className="adminCardManage__tag adminCardManage__tag--expansion">{card.expansion}</span>
                                                        )}
                                                        {card.types.slice(0, 3).map((t) => (
                                                            <span key={t} className="adminCardManage__tag">{t}</span>
                                                        ))}
                                                        {card.types.length > 3 && (
                                                            <span className="adminCardManage__tag adminCardManage__tag--more">+{card.types.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {card.efecto && (
                                                    <p className="adminCardManage__effect">{card.efecto}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="adminCardManage__editor">
                                            <SingleCardForm initialCard={card} onSaved={refetch} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {results.length === 0 && <div className="adminCardManage__empty">No se encontraron cartas.</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageCardsTab;
