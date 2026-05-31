import OneSignal from 'react-onesignal';
import { supabase } from './supabaseClient';

export const initOneSignal = async () => {
    await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
    });
};

export const addUsertosubscriptionList = async (userId: string) => {
    const { error } = await supabase
                    .from('villazarcillo_notification_subscriptions')
                    .upsert({ 
                        user_id: userId, 
                        enabled: true,
                    }, { 
                        onConflict: 'user_id'
                    });
};