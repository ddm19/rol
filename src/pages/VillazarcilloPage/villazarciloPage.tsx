import { useEffect, useRef } from "react"

const VillazarcilloPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        console.log(iframeRef.current?.contentWindow);
    }, [iframeRef]);

    return (
        <>
            <iframe ref={iframeRef} src="https://villazarcillo.vercel.app/" style={{ width: '100%', height: '85vh', border: 'none' }} title="Villazarcillo">

            </iframe>

        </>
    )
}
export default VillazarcilloPage;