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
            <iframe ref={iframeRef} src="https://villazarcillo.vercel.app/" style={{ width: '90%', height: '90vh', border: 'none' }} title="Villazarcillo">

            </iframe>

        </>
    )
}
export default VillazarcilloPage;