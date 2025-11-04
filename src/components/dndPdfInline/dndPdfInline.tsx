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
    faSave,
    faTimes,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import "./dndPdfInline.scss";
import InventoryDisplay, { MagicItem } from "./components/inventoryDisplay";
import Loading from "components/Loading/Loading";

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
                    setAvatarUrl(s?.content?.avatarUrl || "");
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
                const completeValues = { ...values, inventory, magicItems, avatarUrl };
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

    // Cargar avatar desde el bucket (avatars/<sheetName>.*)
    useEffect(() => {
        const loadFromBucket = async () => {
            const name = (sheetName || routeId || "").trim();
            if (!name || name === "new") return;
            const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
            try {
                const { data: items, error } = await supabase.storage
                    .from("CharacterImages")
                    .list("avatars", { limit: 1000 });
                if (error) return;
                const found = (items || []).find((it: any) =>
                    typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()),
                );
                if (found) {
                    const { data: pub } = supabase.storage
                        .from("CharacterImages")
                        .getPublicUrl(`avatars/${found.name}`);
                    if (pub?.publicUrl) {
                        setAvatarUrl(pub.publicUrl);
                        if (viewerReady) {
                            const srcBusted = `${pub.publicUrl}?v=${Date.now()}`;
                            sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" });
                        }
                    }
                }
            } catch (err) {
                // ignore
            }
        };
        loadFromBucket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetName, routeId]);

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
        setIsLoading(true);
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const safeName = (sheetName || routeId || "avatar").replace(/[^a-zA-Z0-9._-]/g, "_");
            const ext = file.name.split('.').pop() || (file.type.includes('png') ? 'png' : file.type.includes('jpeg') ? 'jpg' : 'bin');
            const path = `avatars/${encodeURIComponent(safeName)}.${ext}`;
            const { error: upErr } = await supabase.storage.from("CharacterImages").upload(path, file, {
                cacheControl: "0",
                upsert: true,
                contentType: file.type || undefined,
            });
            if (upErr) throw upErr;
            const { data: pub } = supabase.storage.from("CharacterImages").getPublicUrl(path);
            const publicUrl = pub.publicUrl;
            setAvatarUrl(publicUrl);
            const srcBusted = `${publicUrl}?v=${Date.now()}`;
            sendMessage({ type: "SET_AVATAR", src: srcBusted, fit: "cover" });
        } catch (err) {
            console.error("Error subiendo avatar:", err);
            alert("No se pudo subir el avatar. Inténtalo de nuevo.");
        } finally {
            if (e.target) e.target.value = "";
            setIsLoading(false);
        }
    };
    const clearAvatar = async () => {
        try {
            const name = (sheetName || routeId || "").trim();
            if (name && name !== "new") {
                const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const { data: items } = await supabase.storage.from("CharacterImages").list("avatars", { limit: 1000 });
                const found = (items || []).find((it: any) => typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()));
                if (found) await supabase.storage.from("CharacterImages").remove([`avatars/${found.name}`]);
            }
        } catch (err) {
            console.warn("No se pudo eliminar el avatar del bucket:", err);
        } finally {
            setAvatarUrl("");
            sendMessage({ type: "CLEAR_AVATAR" });
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
                    <button onClick={triggerAvatarPicker}>Subir avatar</button>
                    <button onClick={clearAvatar} title="Quitar avatar">Eliminar avatar</button>
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
            </div>

            <div className="dndPdfInline__iframeContainer">
                {!isLoading ?
                    <iframe className="dndPdfInline__iframe" ref={iframeRef} src={src} name="sheet" />
                    : <Loading />}
            </div>

            <div className="dndPdfInline__inventoryContainer">
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
