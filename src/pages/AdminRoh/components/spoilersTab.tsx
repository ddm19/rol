import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faEye, faEyeSlash, faRocket, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useCardSearch from 'hooks/useCardSearch';
import { useCardRules } from 'hooks/useCardRules';
import { CardDTO, CardRohFields, clearExpansionCardOverrides, normalizeKey, updateCardsRohFields } from 'services/cardsService';
import { upsertExpansion } from 'services/expansionLocks';
import { fetchPackTypes, PackTypeRecord, upsertPackType } from 'services/packTypes';
import { fetchRohSettings, RohSettings, updateRohSettings } from 'services/rohSettings';
import { formatDateTime, fromDateTimeInput, toDateTimeInput } from '../dateInput';
import { RohExpansion, useRohExpansions } from '../useRohExpansions';
import SpoilerCardsBulk, { SpoilerState } from './spoilerCardsBulk';
import ToggleChip from './toggleChip';

type Status = { type: 'success' | 'error'; text: string } | null;

type SpoilerFields = Pick<RohSettings, 'spoiler_expansion' | 'spoiler_description' | 'spoiler_release_at'>;

const SpoilersTab: React.FC = () => {
    const { expansions, reload: reloadExpansions } = useRohExpansions();
    const { all, refetch } = useCardSearch();
    const { getVisibility, reload: reloadRules } = useCardRules();
    const [fields, setFields] = useState<SpoilerFields | null>(null);
    const [savedExpansion, setSavedExpansion] = useState<string | null>(null);
    const [packs, setPacks] = useState<PackTypeRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const loadPacks = useCallback(async () => {
        try {
            setPacks(await fetchPackTypes({ force: true }));
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error cargando sobres' });
        }
    }, []);

    useEffect(() => {
        fetchRohSettings({ force: true })
            .then((settings) => {
                setFields({
                    spoiler_expansion: settings.spoiler_expansion,
                    spoiler_description: settings.spoiler_description,
                    spoiler_release_at: settings.spoiler_release_at,
                });
                setSavedExpansion(settings.spoiler_expansion);
            })
            .catch((err) => setStatus({ type: 'error', text: err?.message || 'Error cargando ajustes' }));
        loadPacks();
        reloadRules(true);
    }, [loadPacks, reloadRules]);

    const expansion: RohExpansion | undefined = useMemo(
        () => expansions.find((exp) => savedExpansion && normalizeKey(exp.expansion) === normalizeKey(savedExpansion)),
        [expansions, savedExpansion]
    );

    const expansionCards = useMemo(
        () => all
            .filter((card) => savedExpansion && card.expansion && normalizeKey(card.expansion) === normalizeKey(savedExpansion))
            .sort((a, b) => a.nombre.localeCompare(b.nombre)),
        [all, savedExpansion]
    );

    const expansionPacks = useMemo(
        () => packs.filter((pack) => savedExpansion && normalizeKey(pack.expansion) === normalizeKey(savedExpansion)),
        [packs, savedExpansion]
    );

    const getState = useCallback((card: CardDTO): SpoilerState => {
        if (card.visibility && card.visibility !== 'hidden' && card.reveal_at && new Date(card.reveal_at).getTime() > Date.now()) {
            return 'scheduled';
        }
        return getVisibility(card) === 'hidden' ? 'hidden' : 'revealed';
    }, [getVisibility]);

    if (!fields) return null;

    const update = <K extends keyof SpoilerFields>(field: K, value: SpoilerFields[K]) => {
        setFields((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            await updateRohSettings({
                spoiler_expansion: fields.spoiler_expansion || null,
                spoiler_description: fields.spoiler_description?.trim() || null,
                spoiler_release_at: fields.spoiler_release_at,
            });
            setSavedExpansion(fields.spoiler_expansion || null);
            setStatus({ type: 'success', text: 'Spoilers guardados' });
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error guardando spoilers' });
        } finally {
            setSaving(false);
        }
    };

    const saveExpansion = async (visibility: RohExpansion['visibility']) => {
        if (!expansion) return;
        await upsertExpansion({
            expansion: expansion.expansion,
            blocked: expansion.blocked || [],
            order_blocked: expansion.order_blocked,
            visibility,
        });
    };

    const handleHideExpansion = async () => {
        setStatus(null);
        try {
            await saveExpansion('hidden');
            await Promise.all([reloadExpansions(), reloadRules(true)]);
            setStatus({ type: 'success', text: 'Las cartas no reveladas ya no aparecen en el catálogo' });
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error ocultando la expansión' });
        }
    };

    const handleTogglePack = async (pack: PackTypeRecord) => {
        setStatus(null);
        try {
            await upsertPackType({ ...pack, activo: !pack.activo });
            await loadPacks();
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error actualizando el sobre' });
        }
    };

    const handleApply = async (ids: string[], cardFields: Partial<CardRohFields>) => {
        await updateCardsRohFields(ids, cardFields);
        await refetch();
    };

    const handleLaunch = async () => {
        if (!expansion) return;
        if (!window.confirm(
            `Vas a lanzar "${expansion.expansion}" al catálogo: todas sus cartas serán visibles y dejará de estar en spoilers. Los bloqueos de rarezas no cambian, se gestionan en Expansiones. ¿Continuar?`
        )) return;

        setLaunching(true);
        setStatus(null);
        try {
            await saveExpansion('visible');
            await clearExpansionCardOverrides(expansion.expansion);
            await updateRohSettings({ spoiler_expansion: null });
            setFields((prev) => (prev ? { ...prev, spoiler_expansion: null } : prev));
            setSavedExpansion(null);
            await Promise.all([reloadExpansions(), reloadRules(true), refetch()]);
            setStatus({ type: 'success', text: `"${expansion.expansion}" ya está en el catálogo` });
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error lanzando la expansión' });
        } finally {
            setLaunching(false);
        }
    };

    return (
        <div className="adminRohPage__section">
            <form className="adminCardForm" onSubmit={handleSave}>
                <h2 className="adminRohPage__formTitle">Expansión en spoilers</h2>
                <div className="adminCardForm__row">
                    <div className="adminCardForm__group adminCardForm__group--grow">
                        <label htmlFor="roh-spoiler-expansion">Expansión</label>
                        <select
                            id="roh-spoiler-expansion"
                            value={fields.spoiler_expansion || ''}
                            onChange={(e) => update('spoiler_expansion', e.target.value || null)}
                        >
                            <option value="">Sin spoilers</option>
                            {expansions.map(({ expansion: name }) => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="roh-spoiler-release">Fecha de lanzamiento</label>
                        <input
                            id="roh-spoiler-release"
                            type="datetime-local"
                            value={toDateTimeInput(fields.spoiler_release_at)}
                            onChange={(e) => update('spoiler_release_at', fromDateTimeInput(e.target.value))}
                        />
                    </div>
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="roh-spoiler-description">Descripción (una línea por párrafo)</label>
                    <textarea
                        id="roh-spoiler-description"
                        value={fields.spoiler_description || ''}
                        onChange={(e) => update('spoiler_description', e.target.value)}
                    />
                </div>
                <button type="submit" className="adminCardForm__submit" disabled={saving}>
                    {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                    Guardar
                </button>
            </form>

            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}

            {savedExpansion && expansion && (
                <>
                    {expansion.visibility === 'visible' && (
                        <div className="adminRohPage__warning">
                            <span>
                                <FontAwesomeIcon icon={faEyeSlash} /> {expansion.expansion} es visible por defecto: sus cartas no reveladas
                                aparecen en el catálogo.
                            </span>
                            <button type="button" className="adminCardForm__cancelButton" onClick={handleHideExpansion}>
                                Ocultar del catálogo
                            </button>
                        </div>
                    )}

                    <div className="adminCardForm">
                        <h2 className="adminRohPage__formTitle">Sobres de {expansion.expansion}</h2>
                        {expansionPacks.length === 0 ? (
                            <p className="adminRohPage__muted">Esta expansión no tiene sobres. Créalos en la pestaña Sobres.</p>
                        ) : (
                            <div className="adminRohPage__chips">
                                {expansionPacks.map((pack) => (
                                    <ToggleChip
                                        key={pack.id}
                                        checked={pack.activo}
                                        onChange={() => handleTogglePack(pack)}
                                        label={`${pack.nombre}: ${pack.activo ? 'se puede pedir' : 'cerrado'}`}
                                        icon={faBox}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <SpoilerCardsBulk cards={expansionCards} getState={getState} onApply={handleApply} />

                    <div className="adminCardForm">
                        <h2 className="adminRohPage__formTitle">Lanzar al catálogo</h2>
                        <p className="adminRohPage__muted">
                            Todas las cartas de {expansion.expansion} pasan al catálogo y la expansión deja de estar en spoilers.
                            Los bloqueos de rarezas no cambian: se gestionan en Expansiones.
                            {fields.spoiler_release_at && ` Lanzamiento previsto: ${formatDateTime(fields.spoiler_release_at)}.`}
                        </p>
                        <button type="button" className="adminCardForm__submit" onClick={handleLaunch} disabled={launching}>
                            <FontAwesomeIcon icon={launching ? faSpinner : faRocket} spin={launching} />
                            Lanzar {expansion.expansion}
                        </button>
                    </div>
                </>
            )}

            {savedExpansion && !expansion && (
                <div className="adminCardForm__notice adminCardForm__notice--error">
                    <FontAwesomeIcon icon={faEye} /> {`La expansión "${savedExpansion}" no existe en Expansiones.`}
                </div>
            )}
        </div>
    );
};

export default SpoilersTab;
