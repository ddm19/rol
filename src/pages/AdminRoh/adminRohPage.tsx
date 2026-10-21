import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { invalidateCardsCache } from 'services/cardsService';
import { invalidateExpansionsCache } from 'services/expansionLocks';
import { invalidateRarityPricesCache } from 'services/rarityPrices';
import { invalidatePackTypesCache } from 'services/packTypes';
import { invalidateRohSettingsCache } from 'services/rohSettings';
import '../AdminCards/adminCardsPage.scss';
import './adminRohPage.scss';
import CoinsTab from './components/coinsTab';
import PricesTab from './components/pricesTab';
import PacksTab from './components/packsTab';
import ExpansionsTab from './components/expansionsTab';
import CardOverridesList from './components/cardOverridesList';
import SpoilersTab from './components/spoilersTab';

type Tab = 'coins' | 'prices' | 'packs' | 'expansions' | 'cards' | 'spoilers';

const TABS: { id: Tab; title: string }[] = [
    { id: 'coins', title: 'Monedas' },
    { id: 'prices', title: 'Precios por rareza' },
    { id: 'packs', title: 'Sobres' },
    { id: 'expansions', title: 'Expansiones' },
    { id: 'cards', title: 'Cartas' },
    { id: 'spoilers', title: 'Spoilers' },
];

const AdminRohPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('coins');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        invalidateCardsCache();
        invalidateExpansionsCache();
        invalidateRarityPricesCache();
        invalidatePackTypesCache();
        invalidateRohSettingsCache();
        setRefreshKey((key) => key + 1);
    };

    return (
        <div className="adminCardsPage">
            <div className="adminCardsPage__header">
                <Link to="/admin" className="adminCardsPage__back">← Volver al panel</Link>
                <div className="adminRohPage__titleRow">
                    <h1>ROH</h1>
                    <button type="button" className="adminCardForm__cancelButton" onClick={handleRefresh}>
                        <FontAwesomeIcon icon={faRotateRight} />
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="adminCardsPage__tabs adminRohPage__tabs">
                {TABS.map(({ id, title }) => (
                    <button
                        key={id}
                        type="button"
                        className={`adminCardsPage__tab${tab === id ? ' is-active' : ''}`}
                        onClick={() => setTab(id)}
                    >
                        {title}
                    </button>
                ))}
            </div>

            <div className="adminCardsPage__content" key={refreshKey}>
                {tab === 'coins' && <CoinsTab />}
                {tab === 'prices' && <PricesTab />}
                {tab === 'packs' && <PacksTab />}
                {tab === 'expansions' && <ExpansionsTab />}
                {tab === 'cards' && <CardOverridesList />}
                {tab === 'spoilers' && <SpoilersTab />}
            </div>
        </div>
    );
};

export default AdminRohPage;
