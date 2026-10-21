import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/Loading/Loading';
import SpoilersPanel from '../SpoilersPanel/spoilersPanel';
import CardModal from '../CardModal/cardModal';
import useCardSearch from 'hooks/useCardSearch';
import { useCardRules } from 'hooks/useCardRules';
import { CardDTO } from 'services/cardsService';
import { fetchRohSettings, RohSettings } from 'services/rohSettings';
import '../cardsPage.scss';

const SpoilersPage: React.FC = () => {
    const { all, loading, refetch } = useCardSearch();
    const { getVisibility, loading: rulesLoading, reload } = useCardRules();
    const [settings, setSettings] = useState<RohSettings | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [active, setActive] = useState<CardDTO | null>(null);

    const loadSettings = useCallback(async (force: boolean) => {
        try {
            setSettings(await fetchRohSettings({ force }));
        } catch (err) {
            console.error('Error fetching ROH settings', err);
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings(false);
    }, [loadSettings]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetch(), reload(true), loadSettings(true)]);
        } finally {
            setRefreshing(false);
        }
    };

    if ((loading && all.length === 0) || rulesLoading || settingsLoading) return <Loading />;

    if (!settings?.spoiler_expansion) {
        return (
            <div className="cardsPageRoot">
                <div className="cardsPage__noSpoilers">
                    <p>Ahora mismo no hay ninguna expansión en spoilers.</p>
                    <Link to="/Cards">Volver al catálogo</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cardsPageRoot">
            <SpoilersPanel
                settings={settings}
                cards={all}
                getVisibility={getVisibility}
                onSelect={(card) => setActive(card)}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />
            {active && <CardModal card={active} onClose={() => setActive(null)} />}
        </div>
    );
};

export default React.memo(SpoilersPage);
