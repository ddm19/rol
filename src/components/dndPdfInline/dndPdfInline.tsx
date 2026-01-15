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
    faExternalLinkAlt,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faSave,
    faTimes,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import "./dndPdfInline.scss";
import InventoryDisplay, { MagicItem } from "./components/inventoryDisplay";
import Loading from "components/Loading/Loading";

const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve();
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.appendChild(script);
    });
};

declare global {
    interface Window {
        imageCompression: any;
    }
}

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
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const [viewerReady, setViewerReady] = useState(false);
    const TARGET_ORIGIN = window.location.origin;

    const { data } = supabase.storage.from("sheets").getPublicUrl("templates/rellenable_castellano_unlocked.pdf");
    const pdfUrl = data.publicUrl;
    const src = `/pdfjs/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

    const sendMessage = (message: Record<string, any>) => {
        const win = iframeRef.current?.contentWindow;
        if (win) win.postMessage(message, TARGET_ORIGIN);
    };

    const isMobile = window.innerWidth <= 768;

    const zoomIn = () => sendMessage({ type: "ZOOM_IN" });
    const zoomOut = () => sendMessage({ type: "ZOOM_OUT" });
    const fitWidth = () => sendMessage({ type: "FIT_WIDTH" });
    const fitPage = () => sendMessage({ type: "FIT_PAGE" });
    const handlePrint = () => sendMessage({ type: "PRINT_PDF" });
    const handleOpenPdf = () => sendMessage({ type: "OPEN_PDF" });

    useEffect(() => {
        if (!isNew && routeId) {
            setIsLoading(true);
            getSheet(routeId)
                .then(async (s) => {
                    setLoadedValues(s?.content || {});
                    setInventory(s?.content?.inventory || "");
                    setMagicItems(s?.content?.magicItems || []);
                    setLastSaved(s?.updated_at || "");

                    // Consolidated avatar loading
                    let url = s?.content?.avatarUrl || "";
                    const name = (s?.id || routeId || "").trim();
                    if (name && name !== "new") {
                        const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
                        try {
                            const { data: items, error } = await supabase.storage
                                .from("CharacterImages")
                                .list("avatars", { limit: 1000 });
                            if (!error) {
                                const found = (items || []).find((it: any) =>
                                    typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()),
                                );
                                if (found) {
                                    const { data: pub } = supabase.storage
                                        .from("CharacterImages")
                                        .getPublicUrl(`avatars/${found.name}`);
                                    if (pub?.publicUrl) {
                                        url = pub.publicUrl;
                                    }
                                }
                            }
                        } catch (err) { /* ignore */ }
                    }
                    setAvatarUrl(url);
                })
                .catch(() => {
                    setLoadedValues({});
                    setInventory("");
                    setMagicItems([]);
                    setAvatarUrl("");
                }).finally(() => {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 8000);
                });
        }
    }, [isNew, routeId]);

    useEffect(() => {
        if (isNew || !routeId) return;
        const autoSave = async () => {
            try {
                const values = await requestPdfValues();
                const completeValues = { ...values, inventory, magicItems, avatarUrl };
                const saved = await upsertSheet(routeId, completeValues);
                setLastSaved(saved.updated_at);
            } catch (err) {
                console.error("Error en autoguardado:", err);
            }
        };
        const interval = setInterval(autoSave, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isNew, routeId, inventory, magicItems, avatarUrl]);

    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            const data = e.data;
            if (!data || typeof data.type !== "string") return;
            if (data.type === "VIEWER_READY") {

                setViewerReady(true);
                blastSetFields(loadedValues);
                if (avatarUrl) {
                    const srcBusted = `${avatarUrl}?v=${Date.now()}`;
                    sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" });
                    setTimeout(() => sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" }), 300);
                    setTimeout(() => sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" }), 900);
                }
            } else if (data.type === "PDF_FIELDS") {
            }
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [loadedValues, avatarUrl]);

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
        if (viewerReady) {
            blastSetFields(loadedValues);
            if (avatarUrl) {
                const srcBusted = `${avatarUrl}?v=${Date.now()}`;
                sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" });
                setTimeout(() => sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" }), 300);
                setTimeout(() => sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" }), 900);
            }
        }
    }, [viewerReady, loadedValues, avatarUrl]);

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
            const completeValues = { ...values, inventory, magicItems, avatarUrl };
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

    // Avatar upload helpers
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerAvatarPicker = () => fileInputRef.current?.click();
    const handleAvatarPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        try {
            await loadScript("https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js");

            if (!window.imageCompression) {
                throw new Error("Image compression library not found.");
            }

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const processedFile = await window.imageCompression(file, options);
            const fileToUpload = new File([processedFile], file.name, { type: file.type, lastModified: new Date().getTime() });


            const safeName = (sheetName || routeId || "avatar").replace(/[^a-zA-Z0-9._-]/g, "_");
            const ext = fileToUpload.name.split('.').pop() || (fileToUpload.type.includes('png') ? 'png' : fileToUpload.type.includes('jpeg') ? 'jpg' : 'bin');
            const path = `avatars/${encodeURIComponent(safeName)}.${ext}`;
            const { error: upErr } = await supabase.storage.from("CharacterImages").upload(path, fileToUpload, {
                cacheControl: "0",
                upsert: true,
                contentType: fileToUpload.type || undefined,
            });
            if (upErr) throw upErr;
            const { data: pub } = supabase.storage.from("CharacterImages").getPublicUrl(path);
            const publicUrl = pub.publicUrl;
            setAvatarUrl(publicUrl);
            const srcBusted = `${publicUrl}?v=${Date.now()}`;
            sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" });
            alert("Avatar subido y guardado con éxito.");
        } catch (err) {
            console.error("Error subiendo avatar:", err);
            alert("No se pudo subir el avatar. Inténtalo de nuevo. Error: " + (err as Error).message);
        } finally {
            if (e.target) e.target.value = "";
        }
    };
    const clearAvatar = async () => {
        if (!avatarUrl) {
            alert("No hay un avatar que eliminar.");
            return;
        }
        if (!window.confirm("¿Estás seguro de que quieres eliminar el avatar? Esta acción no se puede deshacer.")) return;

        try {
            const name = (sheetName || routeId || "").trim();
            if (name && name !== "new") {
                const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const { data: items } = await supabase.storage.from("CharacterImages").list("avatars", { limit: 1000 });
                const found = (items || []).find((it: any) => typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()));
                if (found) {
                    await supabase.storage.from("CharacterImages").remove([`avatars/${found.name}`]);
                }
            }
            setAvatarUrl("");
            sendMessage({ type: "CLEAR_AVATAR" });
            alert("Avatar eliminado con éxito.");
        } catch (err) {
            console.warn("No se pudo eliminar el avatar del bucket:", err);
            alert("Hubo un error al eliminar el avatar. Puede que la imagen ya no exista o no tengas permisos.");
        }
    };

    return (
        <div className="dndPdfInline">
            <div className="dndPdfInline__labelsContainer">
                <button onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </button>

                <div className="dndPdfInline__info">
                    <label>Nombre de la ficha:</label>
                    {isNew && <span> (No podrás cambiarlo luego!)</span>}
                    <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} disabled={!isNew} id="sheetName" />
                </div>

                <div className="dndPdfInline__info">
                    <button onClick={handleSave} disabled={saving} className="dndPdfInline__button--green dndPdfInline__button">
                        {saving ? "Guardando…" : isNew ? "Crear ficha" : "Guardar cambios"}
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                    {lastSaved && (
                        <span className="dndPdfInline__lastSaved">
                            Última vez: {new Date(lastSaved).toLocaleString("es-ES")}
                        </span>
                    )}
                </div>

                <div className="dndPdfInline__info">
                    <button onClick={triggerAvatarPicker}>Subir Ilustración</button>
                    {avatarUrl && <button onClick={clearAvatar} title="Quitar avatar">Eliminar Ilustración</button>}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleAvatarPicked}
                    />
                </div>

                <button
                    className="dndPdfInline__button dndPdfInline__button--red"
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
                <button onClick={handleOpenPdf} title="Abrir en nueva pestaña">
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                </button>
            </div>

            <div className="dndPdfInline__iframeContainer">
                {!isMobile || !isLoading ?
                    <>
                        {isMobile &&
                            <div className="dndPdfInline__mobileWarning">
                                Lo lamentamos, pero el visor de PDFs no funciona en dispositivos móviles.
                                Puedes abrir tu ficha (en modo solo lectura) aquí.
                                <button className="dndPdfInline__info" onClick={handlePrint} rel="noopener noreferrer">
                                    Descargar
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                                <button className="dndPdfInline__info" onClick={handleOpenPdf} rel="noopener noreferrer">
                                    Abrir
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                </button>

                            </div>
                        }

                    </>
                    : <Loading />}
                {!isMobile ?
                    <iframe className="dndPdfInline__iframe" ref={iframeRef} src={src} name="sheet" />
                    :
                    <iframe style={{ height: 1 }} className="dndPdfInline__iframe" ref={iframeRef} src={src} name="sheet" />
                }
                <div className="dndPdfInline__inventoryContainer">
                    <InventoryDisplay
                        inventory={inventory}
                        magicItems={magicItems}
                        onInventoryChange={handleInventoryChange}
                        handleMagicItemsChange={handleMagicItemsChange}
                    />
                </div>
            </div>


        </div>
    );
}
