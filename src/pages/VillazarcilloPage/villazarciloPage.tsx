import { useEffect, useRef } from "react";
import { supabase } from "services/supabaseClient";

const VillazarcilloPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const villazarcilloUrl = import.meta.env.VITE_VILLAZARCILLO_URL;

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleMessageFromIframe = (event: MessageEvent) => {
            if (event.data?.type === 'villazarcillo-ready') {
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                        iframe.contentWindow?.postMessage({
                            type: 'supabase-session',
                            session: session
                        }, villazarcilloUrl);
                    }
                });
            }
        };

        window.addEventListener('message', handleMessageFromIframe);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            iframe.contentWindow?.postMessage({
                type: 'supabase-session',
                session: session
            }, villazarcilloUrl);
        });

        return () => {
            window.removeEventListener('message', handleMessageFromIframe);
            subscription.unsubscribe();
        };
    }, [villazarcilloUrl]);

    return (
        <iframe
            ref={iframeRef}
            src={villazarcilloUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Villazarcillo"
        />
    );
}

export default VillazarcilloPage;