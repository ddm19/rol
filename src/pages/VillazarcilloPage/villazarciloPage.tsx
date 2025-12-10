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
                    }, 'https://villazarcillo.vercel.app');
                }
            });
        };

        iframe.addEventListener('load', handleLoad);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            iframe.contentWindow?.postMessage({
                type: 'supabase-session',
                session: session
            }, 'https://villazarcillo.vercel.app');
        });

        return () => {
            iframe.removeEventListener('load', handleLoad);
            subscription.unsubscribe();
        };
    }, []);

    return (
        <>
            <iframe ref={iframeRef} src="https://villazarcillo.vercel.app/" style={{ width: '100%', height: '85vh', border: 'none' }} title="Villazarcillo">
            </iframe>
        </>
    )
}

export default VillazarcilloPage;