import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { normalizeString } from 'hooks/useCardSearch';
import { CardDTO, CardRohFields } from 'services/cardsService';
import { formatDateTime, fromDateTimeInput } from '../dateInput';

export type SpoilerState = 'hidden' | 'scheduled' | 'revealed';

type Props = {
    cards: CardDTO[];
    getState: (card: CardDTO) => SpoilerState;
    onApply: (ids: string[], fields: Partial<CardRohFields>) => Promise<void>;
};

type Filter = 'all' | SpoilerState;

const STATE_LABELS: Record<SpoilerState, string> = {
    hidden: 'Oculta',
    scheduled: 'Programada',
    revealed: 'Revelada',
};

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'hidden', label: 'Ocultas' },
    { id: 'scheduled', label: 'Programadas' },
    { id: 'revealed', label: 'Reveladas' },
];

const SpoilerCardsBulk: React.FC<Props> = ({ cards, getState, onApply }) => {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [scheduleAt, setScheduleAt] = useState('');
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const counts = useMemo(() => {
        const result: Record<Filter, number> = { all: cards.length, hidden: 0, scheduled: 0, revealed: 0 };
        cards.forEach((card) => { result[getState(card)] += 1; });
        return result;
    }, [cards, getState]);

    const shown = useMemo(() => {
        const search = normalizeString(query.trim());
        return cards.filter((card) => {
            if (filter !== 'all' && getState(card) !== filter) return false;
            return !search || normalizeString(card.nombre).includes(search);
        });
    }, [cards, filter, query, getState]);

    const allShownSelected = shown.length > 0 && shown.every((card) => selected.has(card.id_archivo));

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllShown = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            shown.forEach((card) => {
                if (allShownSelected) next.delete(card.id_archivo);
                else next.add(card.id_archivo);
            });
            return next;
        });
    };

    const apply = async (fields: Partial<CardRohFields>) => {
        setApplying(true);
        setError(null);
        try {
            await onApply(Array.from(selected), fields);
            setSelected(new Set());
            setScheduleAt('');
        } catch (err: any) {
            setError(err?.message || 'Error actualizando las cartas');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="adminCardForm">
            <h2 className="adminRohPage__formTitle">Cartas</h2>

            <div className="adminCardManage__toolbar">
                <div className="adminCardForm__group adminCardManage__toolbarSearch">
                    <label htmlFor="roh-spoiler-search">Buscar</label>
                    <input
                        id="roh-spoiler-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nombre..."
                    />
                </div>
                <div className="adminRohPage__filters">
                    {FILTERS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            className={`adminRohPage__filter${filter === id ? ' is-active' : ''}`}
                            onClick={() => setFilter(id)}
                        >
                            {label} <span>{counts[id]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="adminCardBulk__tableWrapper">
                <table className="adminCardBulk__table adminRohPage__spoilerTable">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={allShownSelected}
                                    onChange={toggleAllShown}
                                    aria-label="Seleccionar todas las visibles"
                                />
                            </th>
                            <th>Carta</th>
                            <th>Rareza</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((card) => {
                            const state = getState(card);
                            const isSelected = selected.has(card.id_archivo);
                            return (
                                <tr
                                    key={card.id_archivo}
                                    className={isSelected ? 'is-selected' : ''}
                                    onClick={() => toggle(card.id_archivo)}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggle(card.id_archivo)}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label={`Seleccionar ${card.nombre}`}
                                        />
                                    </td>
                                    <td>{card.nombre}</td>
                                    <td>{card.rareza || '—'}</td>
                                    <td>
                                        <span className={`adminRohPage__state adminRohPage__state--${state}`}>
                                            {STATE_LABELS[state]}
                                        </span>
                                        {state !== 'hidden' && card.reveal_at && (
                                            <span className="adminRohPage__muted"> {formatDateTime(card.reveal_at)}</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {shown.length === 0 && (
                            <tr>
                                <td colSpan={4} className="adminRohPage__muted">No hay cartas con este filtro</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected.size > 0 && (
                <div className="adminRohPage__bulkBar">
                    <strong>{selected.size} seleccionada{selected.size !== 1 ? 's' : ''}</strong>
                    <button
                        type="button"
                        className="adminCardForm__submit"
                        onClick={() => apply({ visibility: 'spoiler', reveal_at: new Date().toISOString() })}
                        disabled={applying}
                    >
                        <FontAwesomeIcon icon={applying ? faSpinner : faEye} spin={applying} />
                        Revelar ahora
                    </button>
                    <div className="adminRohPage__inline">
                        <input
                            type="datetime-local"
                            value={scheduleAt}
                            onChange={(e) => setScheduleAt(e.target.value)}
                            aria-label="Fecha de revelado"
                        />
                        <button
                            type="button"
                            className="adminCardForm__cancelButton"
                            onClick={() => apply({ visibility: 'spoiler', reveal_at: fromDateTimeInput(scheduleAt) })}
                            disabled={applying || !scheduleAt}
                        >
                            <FontAwesomeIcon icon={faCalendarDays} />
                            Programar
                        </button>
                    </div>
                    <button
                        type="button"
                        className="adminCardForm__cancelButton"
                        onClick={() => apply({ visibility: 'hidden', reveal_at: null })}
                        disabled={applying}
                    >
                        <FontAwesomeIcon icon={faEyeSlash} />
                        Ocultar
                    </button>
                    <button
                        type="button"
                        className="adminRohPage__clearSelection"
                        onClick={() => setSelected(new Set())}
                        disabled={applying}
                    >
                        Quitar selección
                    </button>
                </div>
            )}

            {error && <div className="adminCardForm__notice adminCardForm__notice--error">{error}</div>}
        </div>
    );
};

export default SpoilerCardsBulk;
