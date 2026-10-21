import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faLock, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CardVisibility, clearExpansionCardOverrides, normalizeKey } from 'services/cardsService';
import { upsertExpansion } from 'services/expansionLocks';
import { RohExpansion, useRohExpansions, VISIBILITY_LABELS } from '../useRohExpansions';
import ToggleChip from './toggleChip';

type Status = { type: 'success' | 'error'; text: string } | null;

const ExpansionForm: React.FC<{ expansion: RohExpansion; rarezas: string[]; onSaved: () => void }> = ({ expansion, rarezas, onSaved }) => {
    const [visibility, setVisibility] = useState<CardVisibility>(expansion.visibility);
    const [orderBlocked, setOrderBlocked] = useState(expansion.order_blocked);
    const [blocked, setBlocked] = useState<string[]>(expansion.blocked || []);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const savedKey = JSON.stringify([expansion.visibility, expansion.order_blocked, expansion.blocked || []]);

    useEffect(() => {
        setVisibility(expansion.visibility);
        setOrderBlocked(expansion.order_blocked);
        setBlocked(expansion.blocked || []);
    }, [savedKey]);

    const isRarezaBlocked = (rareza: string) => blocked.some((b) => normalizeKey(b) === normalizeKey(rareza));

    const toggleRareza = (rareza: string) => {
        setBlocked((prev) => (isRarezaBlocked(rareza)
            ? prev.filter((b) => normalizeKey(b) !== normalizeKey(rareza))
            : [...prev, rareza]));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const becomesVisible = expansion.visibility !== 'visible' && visibility === 'visible';
        if (becomesVisible && !window.confirm(
            `Vas a hacer visible toda la expansión "${expansion.expansion}". Se limpiará la visibilidad y la fecha de revelado de todas sus cartas. ¿Continuar?`
        )) return;

        setSaving(true);
        setStatus(null);
        try {
            await upsertExpansion({
                expansion: expansion.expansion,
                blocked,
                visibility,
                order_blocked: orderBlocked,
            });
            if (becomesVisible) await clearExpansionCardOverrides(expansion.expansion);
            setStatus({ type: 'success', text: 'Expansión guardada' });
            onSaved();
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error guardando expansión' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="adminCardForm" onSubmit={handleSave}>
            <h2 className="adminRohPage__formTitle">{expansion.expansion}</h2>
            <div className="adminCardForm__row">
                <div className="adminCardForm__group">
                    <label htmlFor={`roh-exp-visibility-${expansion.expansion}`}>Visibilidad por defecto</label>
                    <select
                        id={`roh-exp-visibility-${expansion.expansion}`}
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as CardVisibility)}
                    >
                        {(Object.keys(VISIBILITY_LABELS) as CardVisibility[]).map((value) => (
                            <option key={value} value={value}>{VISIBILITY_LABELS[value]}</option>
                        ))}
                    </select>
                </div>
                <div className="adminCardForm__group">
                    <label>Pedidos</label>
                    <ToggleChip
                        checked={orderBlocked}
                        onChange={() => setOrderBlocked((prev) => !prev)}
                        label="Bloquear toda la expansión"
                        icon={faLock}
                    />
                </div>
            </div>
            <div className="adminCardForm__group">
                <label>Rarezas solo en sobres</label>
                <div className="adminRohPage__chips">
                    {rarezas.map((rareza) => (
                        <ToggleChip
                            key={rareza}
                            checked={isRarezaBlocked(rareza)}
                            onChange={() => toggleRareza(rareza)}
                            label={rareza}
                            icon={faBox}
                        />
                    ))}
                </div>
            </div>
            <button type="submit" className="adminCardForm__submit" disabled={saving}>
                {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                Guardar
            </button>
            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}
        </form>
    );
};

const NewExpansionForm: React.FC<{ existing: string[]; onCreated: () => void }> = ({ existing, onCreated }) => {
    const [name, setName] = useState('');
    const [visibility, setVisibility] = useState<CardVisibility>('hidden');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const expansion = name.trim();
        if (!expansion) return;
        if (existing.some((current) => normalizeKey(current) === normalizeKey(expansion))) {
            setStatus({ type: 'error', text: `La expansión "${expansion}" ya existe` });
            return;
        }
        setSaving(true);
        setStatus(null);
        try {
            await upsertExpansion({ expansion, blocked: [], visibility, order_blocked: false });
            setName('');
            setStatus({ type: 'success', text: `Expansión "${expansion}" creada` });
            onCreated();
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error creando expansión' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="adminCardForm" onSubmit={handleCreate}>
            <h2 className="adminRohPage__formTitle">Nueva expansión</h2>
            <div className="adminCardForm__row adminRohPage__inline">
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="roh-new-expansion">Nombre</label>
                    <input
                        id="roh-new-expansion"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre exacto que llevarán sus cartas"
                    />
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="roh-new-expansion-visibility">Visibilidad por defecto</label>
                    <select
                        id="roh-new-expansion-visibility"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as CardVisibility)}
                    >
                        {(Object.keys(VISIBILITY_LABELS) as CardVisibility[]).map((value) => (
                            <option key={value} value={value}>{VISIBILITY_LABELS[value]}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button type="submit" className="adminCardForm__submit" disabled={saving || !name.trim()}>
                <FontAwesomeIcon icon={saving ? faSpinner : faPlus} spin={saving} />
                Crear expansión
            </button>
            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}
        </form>
    );
};

const ExpansionsTab: React.FC = () => {
    const { expansions, error, reload } = useRohExpansions();

    const allRarezas = useMemo(() => {
        const byKey = new Map<string, string>();
        expansions.forEach((expansion) => expansion.rarezas.forEach((rareza) => {
            if (!byKey.has(normalizeKey(rareza))) byKey.set(normalizeKey(rareza), rareza);
        }));
        return Array.from(byKey.values());
    }, [expansions]);

    return (
        <div className="adminRohPage__section">
            {error && <div className="adminCardForm__notice adminCardForm__notice--error">{error}</div>}
            <NewExpansionForm existing={expansions.map(({ expansion }) => expansion)} onCreated={reload} />
            {expansions.map((expansion) => (
                <ExpansionForm
                    key={expansion.expansion}
                    expansion={expansion}
                    rarezas={expansion.rarezas.length > 0 ? expansion.rarezas : allRarezas}
                    onSaved={reload}
                />
            ))}
        </div>
    );
};

export default ExpansionsTab;
