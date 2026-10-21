import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'hooks/useAuth';
import { fetchUnseenTransfers, markTransfersSeen } from 'services/coinsService';
import { fetchProfilesDirectory } from 'services/profiles';
import './coinsReceivedNotice.scss';

type ReceivedSummary = {
    from: string;
    amount: number;
};

const CoinsReceivedNotice: React.FC = () => {
    const { user } = useAuth();
    const [received, setReceived] = useState<ReceivedSummary[]>([]);

    useEffect(() => {
        if (!user?.id) {
            setReceived([]);
            return;
        }
        (async () => {
            try {
                const transfers = await fetchUnseenTransfers(user.id);
                if (transfers.length === 0) return;
                const profiles = await fetchProfilesDirectory();
                const names = new Map(profiles.map((profile) => [profile.id, profile.username]));
                const bySender = new Map<string, number>();
                transfers.forEach((transfer) => {
                    bySender.set(transfer.from_user, (bySender.get(transfer.from_user) || 0) + transfer.amount);
                });
                setReceived(Array.from(bySender.entries()).map(([from, amount]) => ({
                    from: names.get(from) || 'Un jugador',
                    amount,
                })));
            } catch (err) {
                console.error('Error cargando monedas recibidas', err);
            }
        })();
    }, [user?.id]);

    if (received.length === 0) return null;

    const handleClose = async () => {
        setReceived([]);
        try {
            await markTransfersSeen();
        } catch (err) {
            console.error('Error marcando monedas recibidas', err);
        }
    };

    return (
        <div className="coinsReceivedNotice" role="status">
            <span className="coinsReceivedNotice__coin">
                <FontAwesomeIcon icon={faCoins} />
            </span>
            <div className="coinsReceivedNotice__body">
                <strong className="coinsReceivedNotice__title">¡Has recibido oro!</strong>
                {received.map(({ from, amount }) => (
                    <span key={from} className="coinsReceivedNotice__line">
                        {from} te ha enviado <b>{amount}</b> monedas
                    </span>
                ))}
            </div>
            <button type="button" className="coinsReceivedNotice__close" onClick={handleClose} aria-label="Cerrar aviso">
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    );
};

export default React.memo(CoinsReceivedNotice);
