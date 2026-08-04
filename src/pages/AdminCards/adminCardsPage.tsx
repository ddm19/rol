import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './adminCardsPage.scss';
import SingleCardForm from './components/singleCardForm';
import BulkUploadForm from './components/bulkUploadForm';
import ManageCardsTab from './components/manageCardsTab';

type Tab = 'single' | 'bulk' | 'manage';

const AdminCardsPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('single');

    return (
        <div className="adminCardsPage">
            <div className="adminCardsPage__header">
                <Link to="/admin" className="adminCardsPage__back">← Volver al panel</Link>
                <h1>Cartas</h1>
            </div>

            <div className="adminCardsPage__tabs">
                <button
                    type="button"
                    className={`adminCardsPage__tab${tab === 'single' ? ' is-active' : ''}`}
                    onClick={() => setTab('single')}
                >
                    Carta individual
                </button>
                <button
                    type="button"
                    className={`adminCardsPage__tab${tab === 'bulk' ? ' is-active' : ''}`}
                    onClick={() => setTab('bulk')}
                >
                    Carga masiva (JSON + imágenes)
                </button>
                <button
                    type="button"
                    className={`adminCardsPage__tab${tab === 'manage' ? ' is-active' : ''}`}
                    onClick={() => setTab('manage')}
                >
                    Ver / editar / eliminar
                </button>
            </div>

            <div className="adminCardsPage__content">
                {tab === 'single' && <SingleCardForm />}
                {tab === 'bulk' && <BulkUploadForm />}
                {tab === 'manage' && <ManageCardsTab />}
            </div>
        </div>
    );
};

export default AdminCardsPage;
