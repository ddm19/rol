import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faChevronDown,
    faCoins,
    faExclamationCircle,
    faMagnifyingGlass,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { refreshCoins, useCoins } from 'hooks/useCoins';
import { normalizeString } from 'hooks/useCardSearch';
import { fetchProfilesDirectory, PublicProfile } from 'services/profiles';
import { fetchReceivableCoins, sendCoins } from 'services/coinsService';
import { fetchRohSettings, RohSettings } from 'services/rohSettings';
import { AVATARS } from 'services/avatars';
import './sendCoinsTab.scss';

const formatPeriod = (days: number) => (days === 1 ? 'cada día' : `cada ${days} días`);

const avatarUrl = (profile: PublicProfile) =>
    AVATARS.find((avatar) => avatar.key === profile.avatar_key)?.url || AVATARS[0].url;

const SendCoinsTab: React.FC = () => {
    const { user } = useAuth();
    const { balance } = useCoins();
    const [profiles, setProfiles] = useState<PublicProfile[]>([]);
    const [selected, setSelected] = useState<PublicProfile | null>(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [receivable, setReceivable] = useState<number | null>(null);
    const [settings, setSettings] = useState<RohSettings | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProfilesDirectory()
            .then((rows) => setProfiles(rows.filter((profile) => profile.id !== user?.id)))
            .catch((err) => {
                console.error('Error loading profiles:', err);
                setError('Error al cargar los jugadores');
            });
    }, [user?.id]);

    useEffect(() => {
        fetchRohSettings()
            .then(setSettings)
            .catch((err) => console.error('Error loading ROH settings:', err));
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    useEffect(() => {
        setReceivable(null);
        if (!selected) return;
        fetchReceivableCoins(selected.id)
            .then(setReceivable)
            .catch((err) => console.error('Error loading receivable coins:', err));
    }, [selected]);

    const filtered = useMemo(() => {
        const query = normalizeString(search.trim());
        return query ? profiles.filter((profile) => normalizeString(profile.username).includes(query)) : profiles;
    }, [profiles, search]);

    const maxAmount = Math.min(balance, receivable ?? 0);
    const parsedAmount = parseInt(amount, 10) || 0;
    const canSend = !!selected && parsedAmount >= 1 && parsedAmount <= maxAmount && !loading;

    const handleSelect = (profile: PublicProfile) => {
        setSelected(profile);
        setOpen(false);
        setSearch('');
        setSuccess(null);
        setError(null);
    };

    const handleSend = async () => {
        if (!user?.id || !selected || !canSend) return;
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await sendCoins(selected.id, parsedAmount);
            await refreshCoins(user.id);
            setReceivable(await fetchReceivableCoins(selected.id));
            setSuccess(`Has enviado ${parsedAmount} monedas a ${selected.username}`);
            setAmount('');
        } catch (err: any) {
            console.error('Error sending coins:', err);
            setError(err?.message || 'Error al enviar las monedas. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sendCoinsTab">
            <div className="sendCoinsTab__container">
                <div className="sendCoinsTab__card">
                    <label className="sendCoinsTab__label">Jugador</label>
                    <div className="sendCoinsTab__dropdown" ref={dropdownRef}>
                        <button
                            type="button"
                            className={`sendCoinsTab__selector${open ? ' is-open' : ''}`}
                            onClick={() => setOpen((prev) => !prev)}
                        >
                            {selected ? (
                                <span className="sendCoinsTab__player">
                                    <img src={avatarUrl(selected)} alt="" className="sendCoinsTab__avatar" />
                                    {selected.username}
                                </span>
                            ) : (
                                <span className="sendCoinsTab__placeholder">Elige a quién enviar oro</span>
                            )}
                            <FontAwesomeIcon icon={faChevronDown} className="sendCoinsTab__chevron" />
                        </button>

                        {open && (
                            <div className="sendCoinsTab__menu">
                                <div className="sendCoinsTab__searchBox">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Buscar jugador..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="sendCoinsTab__options">
                                    {filtered.map((profile) => (
                                        <button
                                            key={profile.id}
                                            type="button"
                                            className={`sendCoinsTab__option${selected?.id === profile.id ? ' is-selected' : ''}`}
                                            onClick={() => handleSelect(profile)}
                                        >
                                            <img src={avatarUrl(profile)} alt="" className="sendCoinsTab__avatar" loading="lazy" />
                                            {profile.username}
                                        </button>
                                    ))}
                                    {filtered.length === 0 && (
                                        <div className="sendCoinsTab__empty">No se encontraron jugadores</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {selected && receivable !== null && settings && (
                        <span className="sendCoinsTab__hint">
                            {receivable > 0
                                ? `Puede recibir ${receivable} monedas más (máximo ${settings.transfer_max_received} ${formatPeriod(settings.transfer_period_days)})`
                                : `Ya ha recibido el máximo de ${settings.transfer_max_received} monedas ${formatPeriod(settings.transfer_period_days)}`}
                        </span>
                    )}

                    <label className="sendCoinsTab__label" htmlFor="send-coins-amount">Cantidad</label>
                    <div className="sendCoinsTab__amount">
                        <FontAwesomeIcon icon={faCoins} />
                        <input
                            id="send-coins-amount"
                            type="number"
                            min="1"
                            max={maxAmount || undefined}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={!selected || maxAmount < 1}
                        />
                        <span className="sendCoinsTab__balance">Tienes {balance}</span>
                    </div>
                </div>

                {error && (
                    <div className="sendCoinsTab__error">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="sendCoinsTab__success">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {success}
                    </div>
                )}

                <button className="sendCoinsTab__button" onClick={handleSend} disabled={!canSend}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {loading
                        ? 'Enviando...'
                        : selected && parsedAmount > 0
                            ? `Enviar ${parsedAmount} a ${selected.username}`
                            : 'Enviar oro'}
                </button>
            </div>
        </div>
    );
};

export default React.memo(SendCoinsTab);
