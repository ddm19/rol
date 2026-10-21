import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useCardSearch from 'hooks/useCardSearch';
import { useCardRules } from 'hooks/useCardRules';
import { CardDTO, CardRohFields, CardVisibility, updateCardRohFields } from 'services/cardsService';
import { fromDateTimeInput, toDateTimeInput } from '../dateInput';
import { VISIBILITY_LABELS } from '../useRohExpansions';

type RowProps = {
    card: CardDTO;
    effectiveVisibility: CardVisibility;
    effectivePrice: number | null;
    blocked: boolean;
    onSaved: () => void;
};

const fieldsFromCard = (card: CardDTO): CardRohFields => ({
    price: card.price ?? null,
    visibility: card.visibility ?? null,
    reveal_at: card.reveal_at ?? null,
    order_blocked: !!card.order_blocked,
});

const CardOverrideRow: React.FC<RowProps> = ({ card, effectiveVisibility, effectivePrice, blocked, onSaved }) => {
    const [fields, setFields] = useState<CardRohFields>(() => fieldsFromCard(card));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initial = fieldsFromCard(card);
    const savedKey = JSON.stringify(initial);
    const dirty = savedKey !== JSON.stringify(fields);

    useEffect(() => setFields(JSON.parse(savedKey)), [savedKey]);

    const save = async (next: CardRohFields) => {
        setSaving(true);
        setError(null);
        try {
            await updateCardRohFields(card.id_archivo, next);
            onSaved();
        } catch (err: any) {
            setError(err?.message || 'Error guardando');
        } finally {
            setSaving(false);
        }
    };

    return (
        <tr>
            <td>
                <div>{card.nombre}</div>
                <div className="adminRohPage__muted">{card.rareza || '—'} · {card.expansion || '—'}</div>
            </td>
            <td>
                <div>{VISIBILITY_LABELS[effectiveVisibility]}</div>
                <div className="adminRohPage__muted">
                    {blocked ? 'Pedido bloqueado' : effectivePrice === null ? 'Sin precio' : (
                        <span className="adminRohPage__coins">
                            <FontAwesomeIcon icon={faCoins} />
                            {effectivePrice}
                        </span>
                    )}
                </div>
            </td>
            <td>
                <input
                    type="number"
                    min="0"
                    placeholder="Base"
                    className="adminRohPage__smallInput"
                    value={fields.price ?? ''}
                    onChange={(e) => setFields((prev) => ({
                        ...prev,
                        price: e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))}
                />
            </td>
            <td>
                <select
                    value={fields.visibility ?? ''}
                    onChange={(e) => setFields((prev) => ({ ...prev, visibility: (e.target.value || null) as CardVisibility | null }))}
                >
                    <option value="">Heredar expansión</option>
                    {(Object.keys(VISIBILITY_LABELS) as CardVisibility[]).map((value) => (
                        <option key={value} value={value}>{VISIBILITY_LABELS[value]}</option>
                    ))}
                </select>
            </td>
            <td>
                <input
                    type="datetime-local"
                    value={toDateTimeInput(fields.reveal_at)}
                    onChange={(e) => setFields((prev) => ({ ...prev, reveal_at: fromDateTimeInput(e.target.value) }))}
                />
            </td>
            <td>
                <input
                    type="checkbox"
                    checked={fields.order_blocked}
                    onChange={(e) => setFields((prev) => ({ ...prev, order_blocked: e.target.checked }))}
                    aria-label="No se puede pedir"
                />
            </td>
            <td>
                <div className="adminRohPage__inline">
                    <button
                        type="button"
                        className="adminCardForm__cancelButton"
                        onClick={() => save(fields)}
                        disabled={!dirty || saving}
                    >
                        {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                        Guardar
                    </button>
                </div>
                {error && <div className="adminCardBulk__status--error">{error}</div>}
            </td>
        </tr>
    );
};

const CardOverridesList: React.FC = () => {
    const { results, all, loading, query, setQuery, expansions, setExpansions, refetch } = useCardSearch();
    const { isBlocked, getPrice, getVisibility } = useCardRules();

    const distinctExpansions = useMemo(() => {
        const set = new Set<string>();
        all.forEach((c) => { if (c.expansion) set.add(c.expansion); });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [all]);

    return (
        <div className="adminCardManage">
            <div className="adminCardManage__toolbar">
                <div className="adminCardForm__group adminCardManage__toolbarSearch">
                    <label htmlFor="roh-cards-search">Buscar</label>
                    <input
                        id="roh-cards-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nombre o efecto..."
                    />
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="roh-cards-expansion">Expansión</label>
                    <select
                        id="roh-cards-expansion"
                        value={expansions[0] || ''}
                        onChange={(e) => setExpansions(e.target.value ? [e.target.value] : [])}
                    >
                        <option value="">Todas</option>
                        {distinctExpansions.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                </div>
            </div>

            {loading && all.length === 0 ? (
                <div className="adminCardManage__loading">Cargando cartas...</div>
            ) : (
                <>
                    <div className="adminCardManage__count">{results.length} cartas</div>
                    <div className="adminCardBulk__tableWrapper">
                        <table className="adminCardBulk__table adminRohPage__cardsTable">
                            <thead>
                                <tr>
                                    <th>Carta</th>
                                    <th>Estado actual</th>
                                    <th>Precio especial</th>
                                    <th>Visibilidad</th>
                                    <th>Aplicar desde</th>
                                    <th>No se puede pedir</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((card) => (
                                    <CardOverrideRow
                                        key={card.id_archivo}
                                        card={card}
                                        effectiveVisibility={getVisibility(card)}
                                        effectivePrice={getPrice(card)}
                                        blocked={isBlocked(card)}
                                        onSaved={refetch}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default CardOverridesList;
