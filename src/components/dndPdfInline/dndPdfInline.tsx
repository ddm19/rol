import { useEffect, useRef, useState } from "react";
import { supabase } from "services/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { getSheet, createSheetWithId, upsertSheet } from "services/sheets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function DnDPdfInline() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const { id: routeId = "" } = useParams();
    const navigate = useNavigate();

    const isNew = routeId === "new";
    const [sheetName, setSheetName] = useState(isNew ? "" : routeId);
    const [loadedValues, setLoadedValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    const { data } = supabase.storage.from("sheets").getPublicUrl("templates/rellenable_castellano.pdf");
    const pdfUrl = data.publicUrl;
    const src = `/pdfjs/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

    useEffect(() => {
        if (!isNew && routeId) {
            getSheet(routeId)
                .then(s => setLoadedValues(s?.content || {}))
                .catch(() => setLoadedValues({}));
        }
    }, [isNew, routeId]);

    useEffect(() => {
        if (!iframeRef.current) return;
        const send = () =>
            iframeRef.current?.contentWindow?.postMessage(
                { type: "SET_PDF_FIELDS", values: loadedValues || {} },
                window.location.origin
            );
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
            iframeRef.current?.contentWindow?.postMessage({ type: "GET_PDF_FIELDS" }, window.location.origin);
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
            alert("Ha ocurrido un error al guardar la ficha: " + (err as Error).message || String(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <label style={{ marginRight: 8 }}>
                Sheet name:
                <input
                    value={sheetName}
                    onChange={e => setSheetName(e.target.value)}
                    disabled={!isNew}
                    style={{ marginLeft: 6 }}
                />
            </label>
            <button onClick={() => navigate(-1)}><FontAwesomeIcon icon={faArrowLeft} /> Volver</button>
            <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>

            <iframe
                ref={iframeRef}
                src={src}
                style={{ width: "100%", height: "100vh", border: 0 }}
            />
        </>
    );
}
