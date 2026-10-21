import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { normalizeKey } from 'services/cardsService';
import { fetchRarityPrices, GENERAL_PRICE_EXPANSION, rarityPriceKey, saveRarityPrice } from 'services/rarityPrices';
import { useRohExpansions } from '../useRohExpansions';

type Status = { type: 'success' | 'error'; text: string } | null;

type PriceCell = {
    rareza: string;
    expansion: string;
    value: string;
};

const PricesTab: React.FC = () => {
    const { expansions } = useRohExpansions();
    const [cells, setCells] = useState<Record<string, PriceCell>>({});
    const [initial, setInitial] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const rarezas = useMemo(() => {
        const byKey = new Map<string, string>();
        expansions.forEach((expansion) => expansion.rarezas.forEach((rareza) => {
            if (!byKey.has(normalizeKey(rareza))) byKey.set(normalizeKey(rareza), rareza);
        }));
        Object.values(cells).forEach(({ rareza }) => {
            if (!byKey.has(normalizeKey(rareza))) byKey.set(normalizeKey(rareza), rareza);
        });
        return Array.from(byKey.values());
    }, [expansions, cells]);

    useEffect(() => {
        fetchRarityPrices({ force: true })
            .then((rows) => {
                const loaded: Record<string, PriceCell> = {};
                rows.forEach((row) => {
                    loaded[rarityPriceKey(row.rareza, row.expansion)] = {
                        rareza: row.rareza,
                        expansion: row.expansion,
                        value: String(row.price),
                    };
                });
                setCells(loaded);
                setInitial(Object.fromEntries(Object.entries(loaded).map(([key, cell]) => [key, cell.value])));
            })
            .catch((err) => setStatus({ type: 'error', text: err?.message || 'Error cargando precios' }));
    }, []);

    const getCell = (rareza: string, expansion: string): PriceCell =>
        cells[rarityPriceKey(rareza, expansion)] || { rareza, expansion, value: '' };

    const updateCell = (rareza: string, expansion: string, value: string) => {
        const key = rarityPriceKey(rareza, expansion);
        setCells((prev) => ({ ...prev, [key]: { ...(prev[key] || { rareza, expansion, value: '' }), value } }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            const changed = Object.entries(cells).filter(([key, cell]) => cell.value !== (initial[key] ?? ''));
            for (const [, cell] of changed) {
                const value = cell.value.trim();
                await saveRarityPrice(cell.rareza, cell.expansion, value === '' ? null : Math.max(0, parseInt(value, 10) || 0));
            }
            setInitial(Object.fromEntries(Object.entries(cells).map(([key, cell]) => [key, cell.value])));
            setStatus({ type: 'success', text: changed.length > 0 ? 'Precios guardados' : 'No hay cambios' });
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error guardando precios' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="adminCardForm" onSubmit={handleSave}>
            <p className="adminRohPage__muted">
                Precio en monedas. Una carta usa su precio especial; si no tiene, el de su rareza en su expansión; si está vacío, el precio general. Sin ninguno, no se puede pedir.
            </p>
            <div className="adminCardBulk__tableWrapper">
                <table className="adminCardBulk__table adminRohPage__cardsTable">
                    <thead>
                        <tr>
                            <th>Rareza</th>
                            <th>General</th>
                            {expansions.map(({ expansion }) => <th key={expansion}>{expansion}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rarezas.map((rareza) => (
                            <tr key={rareza}>
                                <td>{rareza}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Sin precio"
                                        className="adminRohPage__smallInput"
                                        value={getCell(rareza, GENERAL_PRICE_EXPANSION).value}
                                        onChange={(e) => updateCell(rareza, GENERAL_PRICE_EXPANSION, e.target.value)}
                                    />
                                </td>
                                {expansions.map((expansion) => (
                                    <td key={expansion.expansion}>
                                        {expansion.rarezas.some((r) => normalizeKey(r) === normalizeKey(rareza)) ? (
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="General"
                                                className="adminRohPage__smallInput"
                                                value={getCell(rareza, expansion.expansion).value}
                                                onChange={(e) => updateCell(rareza, expansion.expansion, e.target.value)}
                                            />
                                        ) : (
                                            <span className="adminRohPage__muted">—</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button type="submit" className="adminCardForm__submit" disabled={saving}>
                {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                Guardar precios
            </button>
            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}
        </form>
    );
};

export default PricesTab;
