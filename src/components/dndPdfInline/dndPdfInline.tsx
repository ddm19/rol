import { useEffect, useRef, useState } from "react";
import { supabase } from "services/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { getSheet, createSheetWithId, upsertSheet } from "services/sheets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowsAltH,
    faArrowsAltV,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import "./dndPdfInline.scss";

export default function DnDPdfInline() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const { id: routeId = "" } = useParams();
    const navigate = useNavigate();
    const isNew = routeId === "new";
    const [sheetName, setSheetName] = useState(isNew ? "" : routeId);
    const [loadedValues, setLoadedValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [showControls, setShowControls] = useState(true);


    const { data } = supabase.storage.from("sheets").getPublicUrl("templates/rellenable_castellano.pdf");
    const pdfUrl = data.publicUrl;
    const src = `/pdfjs/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

    const sendMessage = (message: Record<string, any>) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, window.location.origin);
        }
    };

    const zoomIn = () => sendMessage({ type: "ZOOM_IN" });
    const zoomOut = () => sendMessage({ type: "ZOOM_OUT" });
    const fitWidth = () => sendMessage({ type: "FIT_WIDTH" });
    const fitPage = () => sendMessage({ type: "FIT_PAGE" });

    useEffect(() => {
        if (!isNew && routeId) {
            getSheet(routeId)
                .then(s => setLoadedValues(s?.content || {}))
                .catch(() => setLoadedValues({}));
        }
    }, [isNew, routeId]);

    useEffect(() => {
        if (!iframeRef.current) return;
        const send = () => {
            iframeRef.current?.contentWindow?.postMessage(
                { type: "SET_PDF_FIELDS", values: loadedValues || {} },
                window.location.origin
            );
        };
        const onLoad = () => {
            send();
            setTimeout(send, 500);
            setTimeout(send, 1200);
        };
        iframeRef.current.addEventListener("load", onLoad, { once: true });
        setTimeout(send, 400);
        return () => iframeRef.current?.removeEventListener("load", onLoad);
    }, [loadedValues]);

    function requestPdfValues(): Promise<Record<string, any>> {
        return new Promise(resolve => {
            const onMsg = (e: MessageEvent) => {
                if (e.data?.type === "PDF_FIELDS") {
                    window.removeEventListener("message", onMsg);
                    resolve(e.data.values || {});
                }
            };
            window.addEventListener("message", onMsg);
            sendMessage({ type: "GET_PDF_FIELDS" });
        });
    }

    const handleSave = async () => {
        if (!sheetName.trim()) {
            alert("Por favor, introduce un nombre para la ficha.");
            return;
        }
        setSaving(true);
        try {
            const values = await requestPdfValues();
            localStorage.setItem(`sheet:${sheetName}`, JSON.stringify(values));
            if (isNew) {
                try {
                    await createSheetWithId(sheetName.trim(), values);
                } catch (e: any) {
                    if (e?.code === "23505") {
                        alert("Ese nombre de ficha ya existe. Elige otro.");
                        return;
                    }
                    throw e;
                }
                navigate(`/sheets/${encodeURIComponent(sheetName.trim())}`, { replace: true });
            } else {
                await upsertSheet(routeId, values);
                alert("Ficha guardada con éxito.");
            }
        } catch (err) {
            console.error(err);
            alert("Ha ocurrido un error al guardar la ficha: " + ((err as Error).message || String(err)));
        } finally {
            setSaving(false);
        }
    };

    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    return (
        <div className="dndPdfInline">
            <div className="dndPdfInline__labelsContainer">
                <button onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </button>
                <div className="dndPdfInline__info">
                    <label>Nombre de la ficha:</label>
                    <input
                        value={sheetName}
                        onChange={e => setSheetName(e.target.value)}
                        disabled={!isNew}
                    />
                </div>
                <button onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando…" : isNew ? "Crear ficha" : "Guardar cambios"}
                </button>
            </div>
            <button className="dndPdfInline__toggleControls" onClick={toggleControls}>
                {!showControls ? (
                    <FontAwesomeIcon icon={faEllipsisV} />
                ) : (
                    <FontAwesomeIcon icon={faTimes} />
                )}

            </button>

            <div className={showControls ? "dndPdfInline__controls--show dndPdfInline__controls" : "dndPdfInline__controls"}>
                <button onClick={zoomIn}>
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                </button>
                <button onClick={zoomOut}>
                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                </button>
                <button onClick={fitWidth}>
                    <FontAwesomeIcon icon={faArrowsAltH} />
                </button>
                <button onClick={fitPage}>
                    <FontAwesomeIcon icon={faArrowsAltV} />
                </button>
            </div>


            <iframe className="dndPdfInline__iframe" ref={iframeRef} src={src} />
        </div>
    );
}
