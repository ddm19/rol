import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@mui/material"
import { useEffect, useRef } from "react"

const VillazarcilloPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        console.log(iframeRef.current?.contentWindow);
    }, [iframeRef]);

    return (
        <>
            <Button onClick={() => iframeRef.current?.contentWindow?.history.back()}><FontAwesomeIcon icon={faArrowLeft} /></Button>
            <iframe ref={iframeRef} src="https://villazarcillo.vercel.app/" style={{ width: '100%', height: '100vh', border: 'none' }} title="Villazarcillo">

            </iframe>

        </>
    )
}
export default VillazarcilloPage;