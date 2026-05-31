import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './notificationsButton.scss';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from 'services/supabaseClient';
import { addUsertosubscriptionList } from 'services/onesignal';

const NotificationsButton = () => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
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

    const canActivateNotifications = () => {
        const platform = getPlatform();

        if (platform === 'desktop') {
            return true;
        }

        return isStandalone();
    };

    const handleClick = () => {
        setIsModalVisible(!isModalVisible);
    };


    const initOneSignal = async () => {
        if (!OneSignal.Session)
            await OneSignal.init({
                appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,

            });

        await OneSignal.Notifications.requestPermission();

        if (Notification.permission === 'granted') {
            const user = (await supabase.auth.getUser()).data?.user?.id;

            if (!user) {
                console.error('❌ No se pudo obtener el ID del usuario de Supabase.');
                return;
            }
            await OneSignal.login(user);

            await addUsertosubscriptionList(user);

            console.log('✅ Permiso concedido y usuario enlazado a OneSignal con ID:', user);
        } else {
            console.log('❌ El usuario no ha concedido el permiso de notificaciones.');
        }
    };

    return (
        <>
            <div className='notificationsModal' style={{ display: isModalVisible ? 'block' : 'none' }}>
                <div className='modalContent'>
                    <h2>Activar Notificaciones</h2>
                    <p>Estado: {permission}</p>
                    {canActivateNotifications() ? (
                        <>
                            <p>¡Puedes activar las notificaciones para recibir actualizaciones en tiempo real!</p>
                            <button onClick={initOneSignal}>Activar Notificaciones</button>
                        </>
                    ) : (
                        <p>Para activar las notificaciones, por favor instala la aplicación como PWA en tu dispositivo móvil.</p>
                    )}
                </div>
            </div>

            <button
                className='notificationsButton'
                onClick={handleClick}
            >
                <FontAwesomeIcon icon={faBell} />

            </button>
        </>
    );
};

export default NotificationsButton