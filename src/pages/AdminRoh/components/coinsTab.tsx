import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchRohSettings, updateRohSettings } from 'services/rohSettings';
import { adjustUserCoins, AdminWalletRow, CoinMovement, fetchAdminWallets, fetchUserCoinMovements } from 'services/coinsService';
import { formatDateTime } from '../dateInput';

type Status = { type: 'success' | 'error'; text: string } | null;

const REASON_LABELS: Record<CoinMovement['reason'], string> = {
    claim: 'Reclamo',
    card_order: 'Pedido de cartas',
    booster_order: 'Pedido de sobre',
    admin: 'Ajuste manual',
    transfer_in: 'Recepción',
    transfer_out: 'Envío',
};

const CoinsTab: React.FC = () => {
    const [coinsPerClaim, setCoinsPerClaim] = useState('');
    const [intervalDays, setIntervalDays] = useState('');
    const [transferMax, setTransferMax] = useState('');
    const [transferPeriodDays, setTransferPeriodDays] = useState('');
    const [wallets, setWallets] = useState<AdminWalletRow[]>([]);
    const [adjustments, setAdjustments] = useState<Record<string, { amount: string; note: string }>>({});
    const [historyUser, setHistoryUser] = useState<string | null>(null);
    const [movements, setMovements] = useState<CoinMovement[]>([]);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const loadWallets = useCallback(async () => {
        try {
            setWallets(await fetchAdminWallets());
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error cargando monederos' });
        }
    }, []);

    useEffect(() => {
        fetchRohSettings({ force: true })
            .then((settings) => {
                setCoinsPerClaim(String(settings.coins_per_claim));
                setIntervalDays(String(settings.claim_interval_days));
                setTransferMax(String(settings.transfer_max_received));
                setTransferPeriodDays(String(settings.transfer_period_days));
            })
            .catch((err) => setStatus({ type: 'error', text: err?.message || 'Error cargando ajustes' }));
        loadWallets();
    }, [loadWallets]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        try {
            await updateRohSettings({
                coins_per_claim: Math.max(0, parseInt(coinsPerClaim, 10) || 0),
                claim_interval_days: Math.max(1, parseInt(intervalDays, 10) || 1),
                transfer_max_received: Math.max(0, parseInt(transferMax, 10) || 0),
                transfer_period_days: Math.max(1, parseInt(transferPeriodDays, 10) || 1),
            });
            setStatus({ type: 'success', text: 'Ajustes de monedas guardados' });
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error guardando ajustes' });
        } finally {
            setSaving(false);
        }
    };

    const updateAdjustment = (userId: string, field: 'amount' | 'note', value: string) => {
        setAdjustments((prev) => ({ ...prev, [userId]: { ...(prev[userId] || { amount: '', note: '' }), [field]: value } }));
    };

    const handleAdjust = async (row: AdminWalletRow) => {
        const adjustment = adjustments[row.user_id];
        const amount = parseInt(adjustment?.amount || '', 10);
        if (!amount) return;
        setStatus(null);
        try {
            await adjustUserCoins(row.user_id, amount, adjustment?.note || '');
            setAdjustments((prev) => ({ ...prev, [row.user_id]: { amount: '', note: '' } }));
            setStatus({ type: 'success', text: `${amount > 0 ? '+' : ''}${amount} monedas para ${row.username || row.email}` });
            await loadWallets();
            if (historyUser === row.user_id) setMovements(await fetchUserCoinMovements(row.user_id));
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error ajustando monedas' });
        }
    };

    const toggleHistory = async (userId: string) => {
        if (historyUser === userId) {
            setHistoryUser(null);
            return;
        }
        setHistoryUser(userId);
        setMovements([]);
        try {
            setMovements(await fetchUserCoinMovements(userId));
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error cargando historial' });
        }
    };

    return (
        <div className="adminRohPage__section">
            <form className="adminCardForm" onSubmit={handleSaveSettings}>
                <div className="adminCardForm__row">
                    <div className="adminCardForm__group">
                        <label htmlFor="roh-coins-per-claim">Monedas por reclamo</label>
                        <input
                            id="roh-coins-per-claim"
                            type="number"
                            min="0"
                            value={coinsPerClaim}
                            onChange={(e) => setCoinsPerClaim(e.target.value)}
                        />
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="roh-claim-interval">Días entre reclamos</label>
                        <input
                            id="roh-claim-interval"
                            type="number"
                            min="1"
                            value={intervalDays}
                            onChange={(e) => setIntervalDays(e.target.value)}
                        />
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="roh-transfer-max">Máximo que puede recibir un jugador</label>
                        <input
                            id="roh-transfer-max"
                            type="number"
                            min="0"
                            value={transferMax}
                            onChange={(e) => setTransferMax(e.target.value)}
                        />
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="roh-transfer-period">Cada cuántos días</label>
                        <input
                            id="roh-transfer-period"
                            type="number"
                            min="1"
                            value={transferPeriodDays}
                            onChange={(e) => setTransferPeriodDays(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="adminCardForm__submit" disabled={saving}>
                    {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                    Guardar
                </button>
            </form>

            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}

            <div className="adminCardBulk__tableWrapper">
                <table className="adminCardBulk__table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Saldo</th>
                            <th>Último reclamo</th>
                            <th>Ajustar</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {wallets.map((row) => (
                            <React.Fragment key={row.user_id}>
                                <tr>
                                    <td>
                                        <div>{row.username || '—'}</div>
                                        <div className="adminRohPage__muted">{row.email}</div>
                                    </td>
                                    <td>
                                        <span className="adminRohPage__coins">
                                            <FontAwesomeIcon icon={faCoins} />
                                            {row.balance}
                                        </span>
                                    </td>
                                    <td>{formatDateTime(row.last_claim_at)}</td>
                                    <td>
                                        <div className="adminRohPage__inline">
                                            <input
                                                type="number"
                                                placeholder="+/-"
                                                className="adminRohPage__smallInput"
                                                value={adjustments[row.user_id]?.amount || ''}
                                                onChange={(e) => updateAdjustment(row.user_id, 'amount', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Nota"
                                                value={adjustments[row.user_id]?.note || ''}
                                                onChange={(e) => updateAdjustment(row.user_id, 'note', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="adminCardForm__cancelButton"
                                                onClick={() => handleAdjust(row)}
                                                disabled={!parseInt(adjustments[row.user_id]?.amount || '', 10)}
                                            >
                                                Aplicar
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="adminCardForm__cancelButton"
                                            onClick={() => toggleHistory(row.user_id)}
                                        >
                                            {historyUser === row.user_id ? 'Ocultar' : 'Historial'}
                                        </button>
                                    </td>
                                </tr>
                                {historyUser === row.user_id && (
                                    <tr>
                                        <td colSpan={5}>
                                            {movements.length === 0 ? (
                                                <span className="adminRohPage__muted">Sin movimientos</span>
                                            ) : (
                                                <ul className="adminRohPage__movements">
                                                    {movements.map((movement) => (
                                                        <li key={movement.id}>
                                                            <span className={movement.amount >= 0 ? 'is-positive' : 'is-negative'}>
                                                                {movement.amount > 0 ? '+' : ''}{movement.amount}
                                                            </span>
                                                            <span>{REASON_LABELS[movement.reason]}</span>
                                                            {movement.note && <span className="adminRohPage__muted">{movement.note}</span>}
                                                            <span className="adminRohPage__muted">{formatDateTime(movement.created_at)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoinsTab;
