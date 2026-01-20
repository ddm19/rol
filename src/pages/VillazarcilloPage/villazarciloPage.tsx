import { useEffect, useRef } from "react";
import { supabase } from "services/supabaseClient";

const VillazarcilloPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    iframe.contentWindow?.postMessage({
                        type: 'supabase-session',
                        session: session
                    }, import.meta.env.VITE_VILLAZARCILLO_URL);
                }
            });
        };

        iframe.addEventListener('load', handleLoad);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            iframe.contentWindow?.postMessage({
                type: 'supabase-session',
                session: session
            }, import.meta.env.VITE_VILLAZARCILLO_URL);
        });

        return () => {
            iframe.removeEventListener('load', handleLoad);
            subscription.unsubscribe();
        };
    }, []);

    return (
        <>
            <iframe ref={iframeRef} src={import.meta.env.VITE_VILLAZARCILLO_URL} style={{ width: '100%', height: '100%', border: 'none' }} title="Villazarcillo">
            </iframe>
        </>
    )
}

export default VillazarcilloPage;