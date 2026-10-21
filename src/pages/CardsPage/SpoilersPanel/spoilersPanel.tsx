import React, { useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faEye, faHourglassHalf, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import CardsGrid from '../CardsGrid/cardsGrid';
import { CardDTO, CardVisibility, normalizeKey } from 'services/cardsService';
import { RohSettings } from 'services/rohSettings';
import { useCountdown } from 'hooks/useCountdown';
import './spoilersPanel.scss';

type Props = {
    settings: RohSettings;
    cards: CardDTO[];
    getVisibility: (card: CardDTO) => CardVisibility;
    onSelect: (card: CardDTO) => void;
    onRefresh: () => void;
    refreshing: boolean;
};

const NEW_REVEAL_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const revealTime = (card: CardDTO) => (card.reveal_at ? new Date(card.reveal_at).getTime() : 0);

const SpoilersPanel: React.FC<Props> = ({ settings, cards, getVisibility, onSelect, onRefresh, refreshing }) => {
    const [now, setNow] = useState(() => Date.now());
    const [filter, setFilter] = useState<string | null>(null);
    const refreshNow = useCallback(() => setNow(Date.now()), []);

    const expansionKey = normalizeKey(settings.spoiler_expansion || '');
    const expansionCards = useMemo(
        () => cards.filter((card) => card.expansion && normalizeKey(card.expansion) === expansionKey),
        [cards, expansionKey]
    );

    const revealed = useMemo(
        () => expansionCards
            .filter((card) => getVisibility(card) !== 'hidden')
            .sort((a, b) => revealTime(b) - revealTime(a) || a.nombre.localeCompare(b.nombre)),
        [expansionCards, getVisibility, now]
    );

    const isNew = useCallback(
        (card: CardDTO) => !!card.reveal_at && now - revealTime(card) <= NEW_REVEAL_WINDOW_MS,
        [now]
    );

    const nextReveal = useMemo(() => {
        const upcoming = expansionCards
            .filter((card) => card.visibility && card.visibility !== 'hidden' && revealTime(card) > now)
            .map(revealTime);
        return upcoming.length > 0 ? new Date(Math.min(...upcoming)) : null;
    }, [expansionCards, now]);

    const releaseDate = useMemo(
        () => (settings.spoiler_release_at ? new Date(settings.spoiler_release_at) : null),
        [settings.spoiler_release_at]
    );

    const releaseCountdown = useCountdown(releaseDate);
    const nextRevealCountdown = useCountdown(nextReveal, refreshNow);

    const rarezas = useMemo(
        () => Array.from(new Set(revealed.map((card) => card.rareza).filter((r): r is string => !!r))),
        [revealed]
    );
    const shown = revealed.filter((card) => !filter || card.rareza === filter);

    const progress = expansionCards.length > 0 ? (revealed.length / expansionCards.length) * 100 : 0;

    return (
        <div className="spoilersPanel">
            <section className="spoilersPanel__hero">
                <button
                    type="button"
                    className="spoilersPanel__refresh"
                    onClick={onRefresh}
                    disabled={refreshing}
                    title="Actualizar spoilers"
                >
                    <FontAwesomeIcon icon={faRotateRight} spin={refreshing} />
                    Actualizar
                </button>
                <span className="spoilersPanel__kicker">
                    <FontAwesomeIcon icon={faEye} />
                    Temporada de spoilers
                </span>
                <h1 className="spoilersPanel__title">{settings.spoiler_expansion}</h1>
                {(settings.spoiler_description || '').split('\n').filter(Boolean).map((line, index) => (
                    <p key={index} className="spoilersPanel__description">{line}</p>
                ))}
                {releaseDate && (
                    <div className="spoilersPanel__release">
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {releaseCountdown
                            ? <span>Lanzamiento en <strong>{releaseCountdown}</strong></span>
                            : <span>¡Ya disponible!</span>}
                    </div>
                )}
            </section>

            <section className="spoilersPanel__stats">
                <div className="spoilersPanel__stat">
                    <span className="spoilersPanel__statValue">{revealed.length} / {expansionCards.length}</span>
                    <span className="spoilersPanel__statLabel">Cartas reveladas</span>
                    <div className="spoilersPanel__progress">
                        <div className="spoilersPanel__progressFill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="spoilersPanel__stat">
                    <span className="spoilersPanel__statValue">
                        <FontAwesomeIcon icon={faHourglassHalf} />
                        {nextRevealCountdown || '—'}
                    </span>
                    <span className="spoilersPanel__statLabel">Próximo revelado</span>
                </div>
            </section>

            {revealed.length > 0 && (
                <div className="spoilersPanel__filters">
                    <button
                        type="button"
                        className={`spoilersPanel__filter${filter === null ? ' is-active' : ''}`}
                        onClick={() => setFilter(null)}
                    >
                        Todas
                    </button>
                    {rarezas.map((rareza) => (
                        <button
                            key={rareza}
                            type="button"
                            className={`spoilersPanel__filter${filter === rareza ? ' is-active' : ''}`}
                            onClick={() => setFilter(rareza)}
                        >
                            {rareza}
                        </button>
                    ))}
                </div>
            )}

            {revealed.length === 0 ? (
                <div className="spoilersPanel__empty">
                    Aún no se ha revelado ninguna carta. ¡Vuelve pronto!
                </div>
            ) : (
                <CardsGrid cards={shown} onSelect={onSelect} isNew={isNew} />
            )}
        </div>
    );
};

export default React.memo(SpoilersPanel);
