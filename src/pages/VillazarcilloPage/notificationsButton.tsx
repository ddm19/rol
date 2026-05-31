import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './notificationsButton.scss';
import { faBell, faTimes, faCheck, faShareSquare, faPlusSquare, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from 'services/supabaseClient';
import { addUsertosubscriptionList, initOneSignal } from 'services/onesignal';

const NotificationsButton = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initOneSignal().then(() => {
            console.log("✅ OneSignal inicializado correctamente.");
        }
        ).catch((e) => {
            console.error("❌ Error al inicializar OneSignal:", e);
        });

        if ('Notification' in window) {
            setPermission(Notification.permission);
        }

        const initializeOneSignal = async () => {
            if (!OneSignal.Session) {
                try {
                    await OneSignal.init({
                        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                        allowLocalhostAsSecureOrigin: true,
                    });
                } catch (e) {
                    console.error("Error initializing OneSignal", e);
                }
            }
            setIsInitialized(true);
        };

        initializeOneSignal();
    }, []);

    const getPlatform = () => {
        const ua = navigator.userAgent.toLowerCase();

        if (/iphone|ipad|ipod/.test(ua)) {
            return 'ios';
        }

        if (/android/.test(ua)) {
            return 'android';
        }

        return 'desktop';
    };

    const isStandalone = () => {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        );
    };

    const handleClick = () => {
        setIsModalVisible(!isModalVisible);
    };

    const requestNotificationPermission = async () => {
        if (!isInitialized) {
            return;
        }

        try {
            await OneSignal.Notifications.requestPermission();

            if (Notification.permission === 'granted') {
                setPermission('granted');
                const user = (await supabase.auth.getUser()).data?.user?.id;

                if (!user) {
                    console.error('❌ No se pudo obtener el ID del usuario de Supabase.');
                    return;
                }
                await OneSignal.login(user);

                await addUsertosubscriptionList(user);

            } else {
                console.log('❌ El usuario no ha concedido el permiso de notificaciones.');
            }
        } catch (e) {
            console.error('Error al solicitar permiso:', e);
        }
    };

    const renderContent = () => {
        const platform = getPlatform();
        const standalone = isStandalone();

        if (platform === 'desktop' || standalone) {
            return (
                <div className="notificationsModal__content-body">
                    <p className="notificationsModal__text">
                        Suscríbete para recibir mensajes de nuevos chats en las misiones a las que estés apuntado. Así como nuevas misiones.
                    </p>
                    <button className="notificationsModal__actionButton" onClick={requestNotificationPermission}>
                        <FontAwesomeIcon icon={faBell} />
                        Suscribirse
                    </button>
                </div>
            );
        }

        if (platform === 'ios') {
            return (
                <div className="notificationsModal__content-body">
                    <p className="notificationsModal__text">
                        Para recibir notificaciones en tu dispositivo iOS, debes instalar la aplicación:
                    </p>
                    <ol className="notificationsModal__list">
                        <li>Toca el botón <strong>Compartir</strong> <FontAwesomeIcon icon={faShareSquare} /> en la barra inferior de Safari.</li>
                        <li>Selecciona <strong>Añadir a la pantalla de inicio</strong> <FontAwesomeIcon icon={faPlusSquare} />.</li>
                        <li>Abre la aplicación y vuelve aquí para suscribirte.</li>
                    </ol>
                </div>
            );
        }

        if (platform === 'android') {
            return (
                <div className="notificationsModal__content-body">
                    <p className="notificationsModal__text">
                        Para recibir notificaciones en tu dispositivo Android, te recomendamos instalar la aplicación:
                    </p>
                    <ol className="notificationsModal__list">
                        <li>Toca el botón de <strong>menú</strong> <FontAwesomeIcon icon={faEllipsisV} /> en la parte superior derecha de tu navegador.</li>
                        <li>Selecciona <strong>Instalar aplicación</strong> o <strong>Añadir a la pantalla de inicio</strong>.</li>
                        <li>Abre la aplicación desde tu pantalla de inicio y vuelve a pulsar la campana para suscribirte.</li>
                    </ol>
                    <p className="notificationsModal__text" style={{ marginTop: '1rem' }}>
                        O si lo prefieres, puedes intentar suscribirte directamente desde aquí:
                    </p>
                    <button className="notificationsModal__actionButton" onClick={requestNotificationPermission} disabled={permission === 'granted'}>
                        <FontAwesomeIcon icon={faBell} />
                        Suscribirse
                    </button>
                </div>
            );
        }
    };

    return (
        <>
            {isModalVisible && (
                <div className="notificationsModal">
                    <div className="notificationsModal__overlay" onClick={handleClick}></div>
                    <div className="notificationsModal__content">
                        <button className="notificationsModal__close" onClick={handleClick} title="Cerrar">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <h2 className="notificationsModal__title">
                            <FontAwesomeIcon icon={faBell} className="notificationsModal__title-icon" />
                            Notificaciones
                        </h2>

                        {permission === 'granted' ? (
                            <div className="notificationsModal__content-body">
                                <p className="notificationsModal__text">
                                    <FontAwesomeIcon icon={faCheck} style={{ color: 'var(--colors-green)', marginRight: '8px' }} />
                                    Ya estás suscrito a las notificaciones! Khaart ya puede contactar contigo.
                                </p>
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </div>
                </div>
            )}

            <button
                className={`notificationsButton ${permission === 'granted' ? 'subscribed' : ''}`}
                onClick={handleClick}
                title="Ajustes de Notificaciones"
            >
                <FontAwesomeIcon icon={faBell} />
            </button>
        </>
    );
};

export default NotificationsButton;