import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import {
    createBoosterOrder,
    getWeeklyBoosterCount,
    getWeeklyLimitResetDate,
    canOrderMoreBoosters
} from 'services/ordersService';
import './orderBoosterTab.scss';

const OrderBoosterTab: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [weeklyCount, setWeeklyCount] = useState(0);
    const [resetDate, setResetDate] = useState<Date | null>(null);
    const [canOrder, setCanOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [timeUntilReset, setTimeUntilReset] = useState('');

    const EXPANSION_NAME = 'Aires de progreso';
    const WEEKLY_LIMIT = 2;
    const BOOSTER_IMAGE = '/images/booster-aires-progreso.png';
    const BOOSTER_IMAGE_LEYENDA = '/images/booster-aires-progreso-leyenda.png';

    // selection: 'normal' | 'leyenda'
    const [selection, setSelection] = useState<'normal' | 'leyenda'>('normal');

    useEffect(() => {
        if (user?.id) {
            loadWeeklyData();
        }
    }, [user?.id]);

    // Recompute whether the user can order based on selection and weeklyCount
    useEffect(() => {
        const requestedQuantity = selection === 'leyenda' ? 2 : 1;
        setCanOrder(weeklyCount + requestedQuantity <= WEEKLY_LIMIT);
    }, [weeklyCount, selection]);

    const loadWeeklyData = async () => {
        try {
            if (!user?.id) return;
            const count = await getWeeklyBoosterCount(user.id);
            const reset = await getWeeklyLimitResetDate(user.id);
            setWeeklyCount(count);
            setResetDate(reset);
            setCanOrder(count < WEEKLY_LIMIT);
        } catch (err) {
            console.error('Error loading weekly data:', err);
            setError('Error al cargar datos del límite semanal');
        }
    };

    const handleOrderBooster = async () => {
        try {
            setError(null);
            setSuccess(false);

            if (!user?.id) {
                setError('Debes estar logueado para hacer pedidos');
                return;
            }

            const requestedQuantity = selection === 'leyenda' ? 2 : 1;
            const canOrderMore = await canOrderMoreBoosters(user.id, requestedQuantity);
            if (!canOrderMore) {
                setError(`No puedes pedir esa opción: ocupas ${requestedQuantity} slot(s). Límite semanal de ${WEEKLY_LIMIT} sobres alcanzado o insuficiente.`);
                return;
            }

            setLoading(true);
            const expansionIdentifier = selection === 'leyenda' ? `${EXPANSION_NAME}-L` : EXPANSION_NAME;
            await createBoosterOrder(user.id, expansionIdentifier, requestedQuantity);

            setSuccess(true);
            setError(null);

            await loadWeeklyData();

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error creating booster order:', err);
            setError('Error al crear la orden. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const getTimeUntilReset = useCallback(() => {
        if (!resetDate) return '';

        const now = new Date();
        const diff = resetDate.getTime() - now.getTime();

        if (diff <= 0) return 'Se reseteará en breve...';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);


        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }, [resetDate]);

    useEffect(() => {
        setTimeUntilReset(getTimeUntilReset());

        if (!resetDate) return;

        const intervalId = window.setInterval(() => {
            setTimeUntilReset(getTimeUntilReset());
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [getTimeUntilReset, resetDate]);

    if (!user) {
        return (
            <div className="orderBoosterTab">
                <div className="orderBoosterTab__message">
                    Debes estar logueado para hacer pedidos
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
                            <div
                                className={`orderBoosterTab__boosterCard ${selection === 'normal' ? 'is-selected' : ''}`}
                                onClick={() => setSelection('normal')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') setSelection('normal'); }}
                            >
                                <img
                                    src={BOOSTER_IMAGE}
                                    alt={`Sobre ${EXPANSION_NAME}`}
                                    className="orderBoosterTab__boosterImage"
                                    draggable={false}
                                />
                                <div className="orderBoosterTab__cardLabel">Normal</div>
                            </div>

                            <div
                                className={`orderBoosterTab__boosterCard ${selection === 'leyenda' ? 'is-selected' : ''}`}
                                onClick={() => setSelection('leyenda')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') setSelection('leyenda'); }}
                            >
                                <img
                                    src={BOOSTER_IMAGE_LEYENDA}
                                    alt={`Sobre ${EXPANSION_NAME} - Leyenda`}
                                    className="orderBoosterTab__boosterImage"
                                    draggable={false}
                                />
                                <div className="orderBoosterTab__cardLabel">Leyenda (Cuenta como 2 sobres)</div>
                            </div>
                        </div>

                        <div className="orderBoosterTab__boosterInfo">
                            <h3>{EXPANSION_NAME}{selection === 'leyenda' ? ' - Leyenda' : ''}</h3>
                            {selection === 'normal' ? (
                                <>
                                    <p>Sobre de cartas de la nueva expansión</p>
                                    <p className="orderBoosterTab__expansion">Contenido:</p>
                                    <p className="orderBoosterTab__expansion">9 cartas aleatorias</p>
                                    <p className="orderBoosterTab__expansion">2 zeones</p>
                                </>
                            ) : (
                                <>
                                    <p>Sobre de Leyenda (sin zeón)</p>
                                    <p className="orderBoosterTab__expansion">Contenido:</p>
                                    <p className="orderBoosterTab__expansion">9 cartas - Mayor probabilidad de Raras</p>
                                    <p className="orderBoosterTab__expansion">1 Héroe o Líder asegurado por Sobre.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="orderBoosterTab__limitSection">
                    <div className="orderBoosterTab__limitCard">
                        <h4>Límite Semanal</h4>
                        <div className="orderBoosterTab__limitContent">
                            <div className="orderBoosterTab__limitBar">
                                <div
                                    className="orderBoosterTab__limitFill"
                                    style={{ width: `${(weeklyCount / WEEKLY_LIMIT) * 100}%` }}
                                />
                            </div>
                            <div className="orderBoosterTab__limitText">
                                <span className="orderBoosterTab__limitCount">
                                    {weeklyCount} / {WEEKLY_LIMIT} sobres
                                </span>
                                {resetDate && (
                                    <span className="orderBoosterTab__resetTime">
                                        Reset en: {timeUntilReset}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="orderBoosterTab__actionSection">
                    {error && (
                        <div className="orderBoosterTab__error">
                            <FontAwesomeIcon icon={faExclamationCircle} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="orderBoosterTab__success">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Sobre pedido exitosamente. Revisa tu correo.
                        </div>
                    )}

                    <button
                        className="orderBoosterTab__button"
                        onClick={handleOrderBooster}
                        disabled={loading || !canOrder || !user}
                        title={!canOrder ? `Has alcanzado el límite de ${WEEKLY_LIMIT} sobres por semana` : ''}
                    >
                        <FontAwesomeIcon icon={faBox} />
                        {loading ? 'Procesando...' : 'Pedir Sobre'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(OrderBoosterTab);
