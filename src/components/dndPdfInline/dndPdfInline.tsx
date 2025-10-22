import { useEffect, useRef, useState } from "react";
import { supabase } from "services/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { getSheet, createSheetWithId, upsertSheet, deleteSheet } from "services/sheets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowsAltH,
    faArrowsAltV,
    faDownload,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faTimes,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import "./dndPdfInline.scss";
import InventoryDisplay, { MagicItem } from "./components/inventoryDisplay";

export default function DnDPdfInline() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const { id: routeId = "" } = useParams();
    const navigate = useNavigate();
    const isNew = routeId === "new";
    const [sheetName, setSheetName] = useState(isNew ? "" : routeId);
    const [loadedValues, setLoadedValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [inventory, setInventory] = useState("");
    const [magicItems, setMagicItems] = useState<MagicItem[]>([]);
    const [lastSaved, setLastSaved] = useState<string>("");

    const [viewerReady, setViewerReady] = useState(false);
    const TARGET_ORIGIN = window.location.origin;

    const { data } = supabase.storage.from("sheets").getPublicUrl("templates/rellenable_castellano_unlocked.pdf");
    const pdfUrl = data.publicUrl;
    const src = `/pdfjs/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

    const sendMessage = (message: Record<string, any>) => {
        const win = iframeRef.current?.contentWindow;
        if (win) win.postMessage(message, TARGET_ORIGIN);
    };

    const zoomIn = () => sendMessage({ type: "ZOOM_IN" });
    const zoomOut = () => sendMessage({ type: "ZOOM_OUT" });
    const fitWidth = () => sendMessage({ type: "FIT_WIDTH" });
    const fitPage = () => sendMessage({ type: "FIT_PAGE" });
    const handlePrint = () => sendMessage({ type: "PRINT_PDF" });

    useEffect(() => {
        if (!isNew && routeId) {
            getSheet(routeId)
                .then((s) => {
                    setLoadedValues(s?.content || {});
                    setInventory(s?.content?.inventory || "");
                    setMagicItems(s?.content?.magicItems || []);
                    setLastSaved(s?.updated_at || "");
                })
                .catch(() => {
                    setLoadedValues({});
                    setInventory("");
                    setMagicItems([]);
                });
        }
    }, [isNew, routeId]);

    useEffect(() => {
        if (isNew || !routeId) return;
        const autoSave = async () => {
            try {
                const values = await requestPdfValues();
                const completeValues = { ...values, inventory, magicItems };
                const saved = await upsertSheet(routeId, completeValues);
                setLastSaved(saved.updated_at);
            } catch (err) {
                console.error("Error en autoguardado:", err);
            }
        };
        const interval = setInterval(autoSave, 20 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isNew, routeId, inventory, magicItems]);

    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            const data = e.data;
            if (!data || typeof data.type !== "string") return;

            if (data.type === "VIEWER_READY") {
                setViewerReady(true);
                blastSetFields(loadedValues);
            } else if (data.type === "PDF_FIELDS") {
            }
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [loadedValues]);

    useEffect(() => {
        const onLoad = () => {
            setViewerReady(false);
            blastSetFields(loadedValues);
        };
        const el = iframeRef.current;
        if (el) el.addEventListener("load", onLoad, { once: true });
        return () => el?.removeEventListener("load", onLoad);
    }, [loadedValues]);

    useEffect(() => {
        if (viewerReady) blastSetFields(loadedValues);
    }, [viewerReady, loadedValues]);

    function blastSetFields(values: Record<string, any>) {
        sendMessage({ type: "SET_PDF_FIELDS", values });
        setTimeout(() => sendMessage({ type: "SET_PDF_FIELDS", values }), 300);
        setTimeout(() => sendMessage({ type: "SET_PDF_FIELDS", values }), 900);
        setTimeout(() => sendMessage({ type: "SET_PDF_FIELDS", values }), 1800);
    }

    function requestPdfValues(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            const onMsg = (e: MessageEvent) => {
                if (e.data?.type === "PDF_FIELDS") {
                    window.removeEventListener("message", onMsg);
                    resolve(e.data.values || {});
                }
            };
            window.addEventListener("message", onMsg);
            sendMessage({ type: "GET_PDF_FIELDS" });
            setTimeout(() => sendMessage({ type: "GET_PDF_FIELDS" }), 400);
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
            const completeValues = { ...values, inventory, magicItems };
            localStorage.setItem(`sheet:${sheetName}`, JSON.stringify(completeValues));

            if (isNew) {
                try {
                    const saved = await createSheetWithId(sheetName.trim(), completeValues);
                    setLastSaved(saved.updated_at);
                } catch (e: any) {
                    if (e?.code === "23505") {
                        alert("Ese nombre de ficha ya existe. Elige otro.");
                        return;
                    }
                    throw e;
                }
                navigate(`/sheets/${encodeURIComponent(sheetName.trim())}`, { replace: true });
            } else {
                const saved = await upsertSheet(routeId, completeValues);
                setLastSaved(saved.updated_at);
                alert("Ficha guardada con éxito.");
            }
        } catch (err) {
            console.error(err);
            alert("Ha ocurrido un error al guardar la ficha: " + ((err as Error).message || String(err)));
        } finally {
            setSaving(false);
        }
    };

    const handleInventoryChange = (value: string) => setInventory(value);
    const handleMagicItemsChange = (items: MagicItem[]) => setMagicItems(items);
    const toggleControls = () => setShowControls((prev) => !prev);

    return (
        <div className="dndPdfInline">
            <div className="dndPdfInline__labelsContainer">
                <button onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </button>

                <div className="dndPdfInline__info">
                    <label>Nombre de la ficha:</label>
                    <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} disabled={!isNew} id="sheetName" />
                </div>

                <div className="dndPdfInline__info">
                    <button onClick={handleSave} disabled={saving}>
                        {saving ? "Guardando…" : isNew ? "Crear ficha" : "Guardar cambios"}
                    </button>
                    {lastSaved && (
                        <span className="dndPdfInline__lastSaved">
                            Última vez: {new Date(lastSaved).toLocaleString("es-ES")}
                        </span>
                    )}
                </div>

                <button
                    onClick={async () => {
                        if (window.confirm("¿Estás seguro de que quieres borrar esta ficha? Esta acción es irreversible.")) {
                            await deleteSheet(routeId);
                            navigate("/profile");
                        }
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} /> Borrar ficha
                </button>
            </div>

            <button className="dndPdfInline__toggleControls" onClick={toggleControls}>
                {!showControls ? <FontAwesomeIcon icon={faEllipsisV} /> : <FontAwesomeIcon icon={faTimes} />}
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
                <button onClick={handlePrint}>
                    <FontAwesomeIcon icon={faDownload} />
                </button>
            </div>

            <div className="dndPdfInline__iframeContainer">
                <iframe className="dndPdfInline__iframe" ref={iframeRef} src={src} name="sheet" />
                <InventoryDisplay
                    inventory={inventory}
                    magicItems={magicItems}
                    onInventoryChange={handleInventoryChange}
                    handleMagicItemsChange={handleMagicItemsChange}
                />
            </div>
        </div>
    );
}
