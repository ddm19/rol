import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCoins, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { refreshCoins, useCoins } from 'hooks/useCoins';
import { createBoosterOrder } from 'services/ordersService';
import { fetchPackTypes, PackTypeRecord } from 'services/packTypes';
import './orderBoosterTab.scss';

type OrderPhase = 'idle' | 'charging' | 'burst' | 'revealed';

const BOOSTER_FALLBACK_IMAGE = '/images/booster-aires-progreso.png';
const CHARGING_DURATION_MS = 1400;
const BURST_DURATION_MS = 700;
const PARTICLE_COUNT = 14;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const OrderBoosterTab: React.FC = () => {
    const { user } = useAuth();
    const { balance } = useCoins();
    const [packs, setPacks] = useState<PackTypeRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [phase, setPhase] = useState<OrderPhase>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPackTypes()
            .then((rows) => {
                const available = rows.filter((pack) => pack.activo && pack.precio != null);
                setPacks(available);
                setSelectedId((current) => current ?? available[0]?.id ?? null);
            })
            .catch((err) => {
                console.error('Error loading packs:', err);
                setError('Error al cargar los sobres disponibles');
            });
    }, []);

    const selected = useMemo(() => packs.find((pack) => pack.id === selectedId) || null, [packs, selectedId]);
    const price = selected?.precio ?? 0;
    const canAfford = !!selected && balance >= price;

    const handleOrderBooster = async () => {
        if (!user?.id || !selected || !canAfford || phase !== 'idle') return;

        try {
            setError(null);
            setPhase('charging');
            await Promise.all([createBoosterOrder(selected.id), wait(CHARGING_DURATION_MS)]);
            setPhase('burst');
            await wait(BURST_DURATION_MS);
            setPhase('revealed');
            await refreshCoins(user.id);
        } catch (err: any) {
            console.error('Error creating booster order:', err);
            setPhase('idle');
            setError(err?.message || 'Error al crear la orden. Por favor intenta de nuevo.');
        }
    };

    if (!user) {
        return (
            <div className="orderBoosterTab">
                <div className="orderBoosterTab__message">
                    Debes estar logueado para hacer pedidos
                </div>
            </div>
        );
    }

    if (packs.length === 0) {
        return (
            <div className="orderBoosterTab">
                <div className="orderBoosterTab__message">
                    {error || 'No hay sobres disponibles ahora mismo'}
                </div>
            </div>
        );
    }

    return (
        <div className="orderBoosterTab">
            <div className="orderBoosterTab__container">
                <div className="orderBoosterTab__boosterDisplay">
                    <div className="orderBoosterTab__boosterWrapper">
                        <div className="orderBoosterTab__boosterRow">
                            {packs.map((pack) => (
                                <div
                                    key={pack.id}
                                    className={`orderBoosterTab__boosterCard ${selectedId === pack.id ? 'is-selected' : ''}`}
                                    onClick={() => setSelectedId(pack.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(pack.id); }}
                                >
                                    <img
                                        src={pack.imagen_url || BOOSTER_FALLBACK_IMAGE}
                                        alt={`Sobre ${pack.nombre}`}
                                        className="orderBoosterTab__boosterImage"
                                        draggable={false}
                                    />
                                    <div className="orderBoosterTab__cardLabel">{pack.nombre}</div>
                                    <div className="orderBoosterTab__price">
                                        <FontAwesomeIcon icon={faCoins} />
                                        {pack.precio}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selected && (
                            <div className="orderBoosterTab__boosterInfo">
                                <h3>{selected.nombre}</h3>
                                {(selected.descripcion || '').split('\n').filter(Boolean).map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="orderBoosterTab__actionSection">
                    {error && (
                        <div className="orderBoosterTab__error">
                            <FontAwesomeIcon icon={faExclamationCircle} />
                            {error}
                        </div>
                    )}

                    {!canAfford && selected && (
                        <div className="orderCardsTab__notEnough">
                            <span className="orderCardsTab__notEnough--important">
                                Sin monedas semanales?
                            </span>
                            <span className="orderCardsTab__notEnough--important">
                                Puedes conseguir más monedas en partidas de rol. Pregunta a tu DM
                            </span>
                        </div>
                    )}

                    <button
                        className="orderBoosterTab__button"
                        onClick={handleOrderBooster}
                        disabled={!canAfford || phase !== 'idle'}
                    >
                        <FontAwesomeIcon icon={faBox} />
                        Pedir sobre
                        <span className="orderBoosterTab__buttonPrice">
                            <FontAwesomeIcon icon={faCoins} />
                            {price}
                        </span>
                    </button>
                </div>
            </div>

            {phase !== 'idle' && selected && (
                <div className={`orderBoosterTab__opening is-${phase}`}>
                    <div className="orderBoosterTab__rays" aria-hidden="true" />
                    <div className="orderBoosterTab__flash" aria-hidden="true" />
                    <div className="orderBoosterTab__particles" aria-hidden="true">
                        {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
                            <span
                                key={index}
                                className="orderBoosterTab__particle"
                                style={{ '--particle-angle': `${(360 / PARTICLE_COUNT) * index}deg` } as React.CSSProperties}
                            >
                                <FontAwesomeIcon icon={faCoins} />
                            </span>
                        ))}
                    </div>
                    <img
                        src={selected.imagen_url || BOOSTER_FALLBACK_IMAGE}
                        alt={`Sobre ${selected.nombre}`}
                        className="orderBoosterTab__openingPack"
                        draggable={false}
                    />
                    {phase === 'revealed' && (
                        <div className="orderBoosterTab__openingText">
                            <h3>¡Sobre pedido!</h3>
                            <p>{selected.nombre} está en camino. Revisa tu correo.</p>
                            <button
                                type="button"
                                className="orderBoosterTab__button"
                                onClick={() => setPhase('idle')}
                            >
                                ¡Genial!
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(OrderBoosterTab);
