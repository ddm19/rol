import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/Loading/Loading';
import SpoilersPanel from '../SpoilersPanel/spoilersPanel';
import CardModal from '../CardModal/cardModal';
import useCardSearch from 'hooks/useCardSearch';
import { useCardRules } from 'hooks/useCardRules';
import { CardDTO } from 'services/cardsService';
import { fetchRohSettings, fetchSpoilerSummary, RohSettings, SpoilerSummary } from 'services/rohSettings';
import '../cardsPage.scss';

const SpoilersPage: React.FC = () => {
    const { all, loading, refetch } = useCardSearch();
    const { getVisibility, loading: rulesLoading, reload } = useCardRules();
    const [settings, setSettings] = useState<RohSettings | null>(null);
    const [summary, setSummary] = useState<SpoilerSummary>({ total_cards: 0, next_reveal_at: null });
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [active, setActive] = useState<CardDTO | null>(null);

    const loadSettings = useCallback(async (force: boolean) => {
        try {
            const [loadedSettings, loadedSummary] = await Promise.all([
                fetchRohSettings({ force }),
                fetchSpoilerSummary().catch((err) => {
                    console.error('Error fetching spoiler summary', err);
                    return { total_cards: 0, next_reveal_at: null };
                }),
            ]);
            setSettings(loadedSettings);
            setSummary(loadedSummary);
        } catch (err) {
            console.error('Error fetching ROH settings', err);
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings(false);
    }, [loadSettings]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetch(), reload(true), loadSettings(true)]);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, reload, loadSettings]);

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
                summary={summary}
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
