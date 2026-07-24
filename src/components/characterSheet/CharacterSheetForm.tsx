import { useEffect, useRef, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { getSheet, createSheetWithId, upsertSheet, deleteSheet, beautifyInventoryMarkdown } from "services/sheets";
import { supabase } from "services/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { faArrowLeft, faArrowUp, faCoins, faDice, faEraser, faFilePdf, faFistRaised, faHandFist, faHeart, faHeartPulse, faMagic, faPen, faPlus, faRunning, faSave, faShield, faTrash, faUpload, faWandMagic, faWandMagicSparkles, faX } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import SectionDisplay, { SectionItem } from "components/dndPdfInline/components/SectionDisplay";
import Loading from "components/Loading/Loading";
import AnnotatedField from "./components/AnnotatedField";
import { AbilityBox, SkillRow, WeaponRow, SpellLevelBlock, SpellEntryRow } from "./components/SheetBits";
import { migrateLegacyContent } from "./migration";
import { ABILITIES, SKILLS, SheetContent, TextAnnotation, WeaponEntry, abilityMod, fmtMod, emptySpells, newId } from "./types";
import "./characterSheetForm.scss";
import { useAuth } from "hooks/useAuth";

type Tab = "stats" | "personality" | "spells";

function parseRgb(css: string): [number, number, number] {
    const m = css.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [247, 241, 225];
}


async function captureElementToPdf(pdf: jsPDF, el: HTMLElement, isFirstPage: boolean, orientation: "landscape" | "portrait", pageBg: string) {
    const canvas = await html2canvas(el, {
        allowTaint: false,
        useCORS: true,
        scale: 2,
        backgroundColor: pageBg,
    });

    if (!isFirstPage) pdf.addPage("a4", orientation);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const [r, g, b] = parseRgb(pageBg);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    const x = (pageWidth - imgW) / 2;
    const y = (pageHeight - imgH) / 2;
    pdf.addImage(imgData, "JPEG", x, y, imgW, imgH);
}

const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export default function CharacterSheetForm() {
    const { id: routeId = "" } = useParams();
    const navigate = useNavigate();
    const isNew = routeId === "new";

    const [sheetName, setSheetName] = useState(isNew ? "" : routeId);
    const [content, setContent] = useState<SheetContent>({});
    const [saving, setSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [inventory, setInventory] = useState("");
    const [story, setStory] = useState("");
    const [magicItems, setMagicItems] = useState<SectionItem[]>([]);
    const [tab, setTab] = useState<Tab>("stats");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [weaponsEditMode, setWeaponsEditMode] = useState(false);
    const dirtyRef = useRef(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const inventoryRef = useRef<HTMLDivElement | null>(null);
    const [sheetOwner, setSheetOwner] = useState("");
    const user = useAuth();
    const isOwner = user?.user?.id == sheetOwner;

    // ---------- botón volver arriba (móvil) ----------
    useEffect(() => {
        const getScrollTop = () => Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
        const onScroll = () => setShowScrollTop(getScrollTop() > 400);
        window.addEventListener("scroll", onScroll, { passive: true });
        document.body.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            document.body.removeEventListener("scroll", onScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
        document.body.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ---------- carga ----------
    useEffect(() => {
        if (isNew || !routeId) return;
        setIsLoading(true);
        getSheet(routeId)
            .then(async (s) => {
                const migrated = migrateLegacyContent(s?.content || {});
                setContent(migrated);
                setInventory(migrated.inventory || "");
                setMagicItems((migrated.magicItems as SectionItem[]) || []);
                setStory(s?.story || "");
                setLastSaved(s?.updated_at || "");
                setSheetOwner(s?.owner || "");


                let url = migrated.avatarUrl || "";
                const name = (s?.id || routeId || "").trim();
                if (name && name !== "new") {
                    const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
                    try {
                        const { data: items, error } = await supabase.storage.from("CharacterImages").list("avatars", { limit: 1000 });
                        if (!error) {
                            const found = (items || []).find((it: any) => typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()));
                            if (found) {
                                const { data: pub } = supabase.storage.from("CharacterImages").getPublicUrl(`avatars/${found.name}`);
                                if (pub?.publicUrl) url = pub.publicUrl;
                            }
                        }
                    } catch (err) {
                        console.warn("Error buscando avatar en bucket:", err);
                    }
                }
                setAvatarUrl(url);
            })
            .catch(() => {
                setContent(migrateLegacyContent({}));
                setInventory("");
                setMagicItems([]);
                setAvatarUrl("");
            })
            .finally(() => setIsLoading(false));
    }, [isNew, routeId]);

    const patch = useCallback((changes: Partial<SheetContent>) => {
        dirtyRef.current = true;
        setContent((prev) => ({ ...prev, ...changes }));
    }, []);

    const setField = useCallback((key: string) => (value: string) => patch({ [key]: value } as Partial<SheetContent>), [patch]);

    const annotationsFor = useCallback((fieldId: string) => content.annotations?.[fieldId] || [], [content.annotations]);
    const setAnnotationsFor = useCallback(
        (fieldId: string, list: TextAnnotation[]) => {
            patch({ annotations: { ...(content.annotations || {}), [fieldId]: list } });
        },
        [content.annotations, patch],
    );

    const textAlignFor = useCallback((fieldId: string) => content.textAlign?.[fieldId] || "left", [content.textAlign]);
    const setTextAlignFor = useCallback(
        (fieldId: string, align: "left" | "center" | "right") => {
            patch({ textAlign: { ...(content.textAlign || {}), [fieldId]: align } });
        },
        [content.textAlign, patch],
    );

    const profBonus = parseInt(content.ProfBonus || "2", 10) || 0;
    const passivePerception = 10 + abilityMod(content.WISscore) + (content.perPROF ? profBonus * (content.perPROFExpertise ? 2 : 1) : 0);

    const strScore = parseInt(content.STRscore || "0", 10) || 0;
    const carryCapacity = strScore * 15;
    const pushDragLift = strScore * 30;

    // ---------- autoguardado 15 min ----------
    useEffect(() => {
        if (isNew || !routeId) return;
        const autoSave = async () => {
            if (!dirtyRef.current) return;
            try {
                if (window.confirm("Hace 15 minutos que no guardas. ¿Quieres guardar automáticamente?")) {
                    await doSave();
                }
            } catch (err) {
                console.error("Error en autoguardado:", err);
            }
        };
        const interval = setInterval(autoSave, 15 * 60 * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew, routeId, content, inventory, magicItems, avatarUrl, story]);

    const buildPayload = useCallback((): SheetContent => ({ ...content, inventory, magicItems, avatarUrl, schemaVersion: 2 }), [content, inventory, magicItems, avatarUrl]);

    const doSave = async () => {
        const completeValues = buildPayload();
        if (isNew) {
            const saved = await createSheetWithId(sheetName.trim(), completeValues);
            setLastSaved(saved.updated_at);
            dirtyRef.current = false;
            navigate(`/sheets/${encodeURIComponent(sheetName.trim())}`, { replace: true });
        } else {
            const saved = await upsertSheet(routeId, completeValues, story);
            setLastSaved(saved.updated_at);
            dirtyRef.current = false;
        }
    };

    const handleSave = async () => {
        if (!sheetName.trim()) {
            alert("Por favor, introduce un nombre para la ficha.");
            return;
        }
        setSaving(true);
        try {
            await doSave();
            if (!isNew) alert("Ficha guardada con éxito.");
        } catch (err: any) {
            if (err?.code === "23505") {
                alert("Ese nombre de ficha ya existe. Elige otro.");
            } else {
                console.error(err);
                alert("Ha ocurrido un error al guardar la ficha: " + (err.message || String(err)));
            }
        } finally {
            setSaving(false);
        }
    };

    // ---------- descargar PDF ----------
    const handleDownloadPdf = async () => {
        if (!sheetRef.current || exportingPdf) return;
        setExportingPdf(true);
        const previousTab = tab;
        try {
            await document.fonts?.ready;
            const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
            const tabsToExport: Tab[] = ["stats", "personality", "spells"];
            const pageBg = getComputedStyle(sheetRef.current).backgroundColor;

            for (let i = 0; i < tabsToExport.length; i++) {
                flushSync(() => setTab(tabsToExport[i]));
                await waitForPaint();

                if (!sheetRef.current) continue;
                await captureElementToPdf(pdf, sheetRef.current, i === 0, "landscape", pageBg);
            }

            if (inventoryRef.current) {
                await waitForPaint();
                await captureElementToPdf(pdf, inventoryRef.current, false, "portrait", pageBg);
            }

            pdf.save(`Ficha_${(sheetName || routeId || "personaje").trim()}.pdf`);
        } catch (err) {
            console.error("Error generando el PDF:", err);
            alert("No se pudo generar el PDF. Inténtalo de nuevo.");
        } finally {
            flushSync(() => setTab(previousTab));
            setExportingPdf(false);
        }
    };

    // ---------- avatar ----------
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerAvatarPicker = () => {
        if (window.confirm("¿Quieres guardar la ficha antes de subir un avatar para evitar pérdida de datos?")) {
            handleSave().then(() => fileInputRef.current?.click());
        } else {
            fileInputRef.current?.click();
        }
    };
    const handleAvatarPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const safeName = (sheetName || routeId || "avatar").replace(/[^a-zA-Z0-9._-]/g, "_");
            const ext = file.name.split(".").pop() || "png";
            const path = `avatars/${encodeURIComponent(safeName)}.${ext}`;
            const { error: upErr } = await supabase.storage.from("CharacterImages").upload(path, file, { cacheControl: "0", upsert: true, contentType: file.type || undefined });
            if (upErr) throw upErr;
            const { data: pub } = supabase.storage.from("CharacterImages").getPublicUrl(path);
            setAvatarUrl(pub.publicUrl);
            alert("Avatar subido y guardado con éxito.");
        } catch (err) {
            console.error("Error subiendo avatar:", err);
            alert("No se pudo subir el avatar. Inténtalo de nuevo. Error: " + (err as Error).message);
        } finally {
            if (e.target) e.target.value = "";
        }
    };
    const clearAvatar = async () => {
        if (!avatarUrl) return;
        if (!window.confirm("¿Estás seguro de que quieres eliminar el avatar? Esta acción no se puede deshacer.")) return;
        try {
            const name = (sheetName || routeId || "").trim();
            if (name && name !== "new") {
                const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const { data: items } = await supabase.storage.from("CharacterImages").list("avatars", { limit: 1000 });
                const found = (items || []).find((it: any) => typeof it?.name === "string" && it.name.toLowerCase().startsWith((safe + ".").toLowerCase()));
                if (found) await supabase.storage.from("CharacterImages").remove([`avatars/${found.name}`]);
            }
            setAvatarUrl("");
        } catch (err) {
            console.warn("No se pudo eliminar el avatar del bucket:", err);
            alert("Hubo un error al eliminar el avatar.");
        }
    };

    const spells = content.spells || emptySpells();
    const setSpells = (s: typeof spells) => patch({ spells: s });

    const MIN_WEAPONS = 3;
    const weapons: WeaponEntry[] = (
        content.weapons && content.weapons.length
            ? content.weapons
            : [
                { id: "weapon_default_0", name: "", atkBonus: "", damage: "" },
                { id: "weapon_default_1", name: "", atkBonus: "", damage: "" },
                { id: "weapon_default_2", name: "", atkBonus: "", damage: "" },
            ]
    ).map((w, idx) => (w.id ? w : { ...w, id: `legacy_weapon_${idx}` }));
    const addWeapon = () => patch({ weapons: [...weapons, { id: newId("weapon"), name: "", atkBonus: "", damage: "" }] });
    const removeWeapon = (id: string) => patch({ weapons: weapons.filter((w) => w.id !== id) });

    if (isLoading) return <Loading />;

    const af = (fieldId: string, value: string, onChange: (v: string) => void, opts: { multiline?: boolean; rows?: number; placeholder?: string; className?: string } = {}) => (
        <AnnotatedField
            fieldId={fieldId}
            value={value}
            onValueChange={onChange}
            annotations={annotationsFor(fieldId)}
            onAnnotationsChange={(list) => setAnnotationsFor(fieldId, list)}
            multiline={opts.multiline}
            rows={opts.rows}
            placeholder={opts.placeholder}
            className={opts.className}
            textAlign={textAlignFor(fieldId)}
            onTextAlignChange={opts.multiline === false ? undefined : (align) => setTextAlignFor(fieldId, align)}
        />
    );



    return (
        <div className="characterSheetForm__container">
            <div className="characterSheetForm">
                <div className="characterSheetForm__topbar">
                    <button onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </button>

                    <div className="characterSheetForm__info">
                        <label>Nombre de la ficha:</label>
                        {isNew && <span> (No podrás cambiarlo luego!)</span>}
                        <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} disabled={!isNew} />
                    </div>

                    <div className="characterSheetForm__info">
                        {isOwner || isNew ?
                            <button onClick={handleSave} disabled={saving} className="characterSheetForm__button--green characterSheetForm__button">
                                <FontAwesomeIcon icon={faSave} />
                                {saving ? "Guardando…" : isNew ? "Crear ficha" : "Guardar cambios"}
                            </button>
                            : ""
                        }
                        {!isOwner && !isNew ? <h2 className="error">No eres el dueño de esta ficha</h2> : ""}

                        {lastSaved && <span className="characterSheetForm__lastSaved">
                            Última vez: {new Date(lastSaved).toLocaleString("es-ES")}</span>}
                        {!isNew && (
                            <button onClick={handleDownloadPdf} disabled={exportingPdf} title="Descarga la ficha en PDF, con las 3 pestañas como páginas">
                                <FontAwesomeIcon icon={faFilePdf} />
                                {exportingPdf ? "Generando PDF…" : "Descargar ficha"}
                            </button>
                        )}

                    </div>

                    <div className="characterSheetForm__info">
                        <button onClick={triggerAvatarPicker}>
                            <FontAwesomeIcon icon={faUpload} />
                            Subir Ilustración</button>
                        {avatarUrl && (
                            <button onClick={clearAvatar} title="Quitar avatar">
                                <FontAwesomeIcon icon={faEraser} />

                                Eliminar Ilustración
                            </button>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleAvatarPicked} />
                    </div>

                    {!isNew && (
                        <button
                            className="characterSheetForm__button characterSheetForm__button--red"
                            onClick={async () => {
                                if (window.confirm("¿Estás seguro de que quieres borrar esta ficha? Esta acción es irreversible.")) {
                                    await deleteSheet(routeId);
                                    navigate("/profile");
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Borrar ficha
                        </button>
                    )}
                </div>

                <div className="characterSheetForm__tabs">
                    <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>
                        Estadísticas
                    </button>
                    <button className={tab === "personality" ? "active" : ""} onClick={() => setTab("personality")}>
                        Personalidad e Historia
                    </button>
                    <button className={tab === "spells" ? "active" : ""} onClick={() => setTab("spells")}>
                        Hechizos
                    </button>
                </div>

                <div className="characterSheetForm__sheet" ref={sheetRef}>
                    {avatarUrl && (
                        <div className="characterSheetForm__avatar">
                            <img src={avatarUrl} alt="Retrato del personaje" />
                        </div>
                    )}

                    {tab === "stats" && (
                        <div className="sheetPage">
                            <div className="sheetHeader">
                                <div className="sheetHeader__name">{af("CharacterName", content.CharacterName || "", setField("CharacterName"), { multiline: false, placeholder: "Nombre del personaje" })}</div>
                                <div className="sheetHeader__row">
                                    <div className="field">
                                        <label>Clase y nivel</label>
                                        {af("ClassLevel", content.ClassLevel || "", setField("ClassLevel"), { multiline: false })}
                                    </div>
                                    <div className="field">
                                        <label>Trasfondo</label>
                                        {af("Background", content.Background || "", setField("Background"), { multiline: false })}
                                    </div>
                                    <div className="field">
                                        <label>Nombre del jugador</label>
                                        {af("PlayerName", content.PlayerName || "", setField("PlayerName"), { multiline: false })}
                                    </div>
                                </div>
                                <div className="sheetHeader__row">
                                    <div className="field">
                                        <label>Raza</label>
                                        {af("Race", content.Race || "", setField("Race"), { multiline: false })}
                                    </div>
                                    <div className="field">
                                        <label>Alineamiento</label>
                                        {af("Alignment", content.Alignment || "", setField("Alignment"), { multiline: false })}
                                    </div>
                                    <div className="field">
                                        <label>Experiencia</label>
                                        {af("XP", content.XP || "", setField("XP"), { multiline: false })}
                                    </div>
                                </div>
                            </div>

                            <div className="sheetPage__grid">
                                <div className="sheetPage__col sheetPage__col--abilities">
                                    <div className="card card--compact">
                                        <label className="card__title">
                                            Bono competencia
                                        </label>
                                        <input className="annotatedField__editable" min="0" value={content.ProfBonus || ""} onChange={(e) => setField("ProfBonus")(e.target.value)} />

                                    </div>
                                    <label id="inspiration" className="card card--compact card--checkbox card__title">
                                        Inspiración
                                        <input type="checkbox" checked={!!content.Inspiration} onChange={(e) => patch({ Inspiration: e.target.checked })} />
                                    </label>
                                    {ABILITIES.map((a) => (
                                        <AbilityBox
                                            key={a.key}
                                            label={a.label}
                                            score={content[`${a.key}score`] || ""}
                                            savePROF={!!content[`${a.key}savePROF`]}
                                            profBonus={profBonus}
                                            onScoreChange={(v) => patch({ [`${a.key}score`]: v } as any)}
                                            onSaveProfChange={(v) => patch({ [`${a.key}savePROF`]: v } as any)}
                                            extra={
                                                a.key === "STR" ? (
                                                    <>
                                                        <div className="abilityBox__carryRow">
                                                            <span>Carga máxima</span>
                                                            <strong>{carryCapacity} lb</strong>
                                                        </div>
                                                        <div className="abilityBox__carryRow">
                                                            <span>Empujar, arrastrar o levantar</span>
                                                            <strong>{pushDragLift} lb</strong>
                                                        </div>
                                                    </>
                                                ) : undefined
                                            }
                                        />
                                    ))}
                                </div>

                                <div className="sheetPage__col sheetPage__col--skills">
                                    <div className="card combatStats">
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faShield} />
                                                CA
                                            </div>
                                            <input value={content.AC || ""} onChange={(e) => setField("AC")(e.target.value)} />
                                        </label>
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faHandFist} />
                                                Iniciativa

                                            </div>
                                            <input value={content.Initiative || fmtMod(abilityMod(content.DEXscore))} onChange={(e) => setField("Initiative")(e.target.value)} />
                                        </label>
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faRunning} />
                                                Velocidad
                                            </div>
                                            <input value={content.Speed || ""} onChange={(e) => setField("Speed")(e.target.value)} />
                                        </label>
                                    </div>
                                    <div className="card combatStats">
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faHeart} />
                                                PG máx.
                                            </div>
                                            <input value={content.HPMax || ""} onChange={(e) => setField("HPMax")(e.target.value)} />
                                        </label>
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faHeartRegular} />
                                                PG actuales
                                            </div>
                                            <input value={content.HPCurrent || ""} onChange={(e) => setField("HPCurrent")(e.target.value)} />
                                        </label>
                                        <label>
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faHeartPulse} />
                                                PG temp.
                                            </div>
                                            <input value={content.HPTemp || ""} onChange={(e) => setField("HPTemp")(e.target.value)} />
                                        </label>
                                    </div>
                                    <div className="card combatStats">
                                        <label className="card--flex">
                                            <div className="combatStats">
                                                <FontAwesomeIcon icon={faDice} />
                                                Dados golpe
                                            </div>
                                            <input value={content.HD || ""} onChange={(e) => setField("HD")(e.target.value)} />
                                            <label>
                                                <div className="combatStats">
                                                    <FontAwesomeIcon icon={faDice} />
                                                    Total dados golpe
                                                </div>
                                                <input value={content.HDTotal || ""} type="number" onChange={(e) => setField("HDTotal")(e.target.value)} />
                                            </label>
                                        </label>

                                        <div className="deathSaves">
                                            <label className="card__title">Salvaciones de muerte</label>
                                            <div className="deathSaves__row">
                                                Éxitos:
                                                <div className="deathSaves__marks">
                                                    {content.deathSaves?.successes !== 0 && <span className="deathSaves__cancel" onClick={() => {
                                                        patch({ deathSaves: { ...(content.deathSaves || { successes: 0, failures: 0 }), successes: 0 } })
                                                    }}>
                                                        <FontAwesomeIcon icon={faX} />
                                                    </span>}
                                                    {[0, 1, 2].map((i) => (
                                                        <input
                                                            key={i}
                                                            type="checkbox"
                                                            checked={(content.deathSaves?.successes || 0) > i}
                                                            className="deathSave__success"
                                                            onChange={() =>
                                                                patch({
                                                                    deathSaves: { ...(content.deathSaves || { successes: 0, failures: 0 }), successes: i + 1 === (content.deathSaves?.successes || 0) ? i : i + 1 },
                                                                })
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="deathSaves__row">
                                                Fallos:
                                                <div className="deathSaves__marks">
                                                    {content.deathSaves?.failures !== 0 && <span className="deathSaves__cancel" onClick={() => {
                                                        patch({
                                                            deathSaves: { ...(content.deathSaves?.failures !== undefined ? content.deathSaves : { successes: 0, failures: 0 }), failures: 0 },
                                                        })
                                                    }}><FontAwesomeIcon icon={faX} /> </span>}

                                                    {[0, 1, 2].map((i) => (
                                                        <input
                                                            key={i}
                                                            type="checkbox"
                                                            checked={(content.deathSaves?.failures || 0) > i}
                                                            className="deathSave__failure"
                                                            onChange={() =>
                                                                patch({
                                                                    deathSaves: { ...(content.deathSaves || { successes: 0, failures: 0 }), failures: i + 1 === (content.deathSaves?.failures || 0) ? i : i + 1 },
                                                                })
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card--flex">
                                        <div className="card skillsList">
                                            <div className="skillsList__passive">Sabiduría pasiva (Percepción): {passivePerception}</div>

                                            {ABILITIES.map((a) => {
                                                const abilitySkills = SKILLS.filter((s) => s.ability === a.key);
                                                if (abilitySkills.length === 0) return null;

                                                return (
                                                    <div className="skillsList__group" key={a.key}>
                                                        <div className="skillsList__groupHeader">{a.label}</div>
                                                        {abilitySkills.map((s) => (
                                                            <SkillRow
                                                                key={s.key}
                                                                def={s}
                                                                score={content[`${s.ability}score`] || ""}
                                                                proficient={!!content[s.profKey]}
                                                                profBonus={profBonus}
                                                                onProfChange={(v) => patch({ [s.profKey]: v } as any)}
                                                                expertise={!!content[`${s.profKey}Expertise`]}
                                                                onExpertiseChange={(v) => patch({ [`${s.profKey}Expertise`]: v } as any)}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                    <div className="card">
                                        <label className="card__title">Otras competencias e idiomas</label>
                                        {af("ProficienciesLang", content.ProficienciesLang || "", setField("ProficienciesLang"), { rows: 5 })}
                                    </div>
                                </div>

                                <div className="sheetPage__col sheetPage__col--details">
                                    <div className="card">
                                        <button
                                            type="button"
                                            className={`card__editToggle ${weaponsEditMode ? "active" : ""}`}
                                            onClick={() => setWeaponsEditMode((v) => !v)}
                                            title={weaponsEditMode ? "Ocultar botones de borrar" : "Mostrar botones de borrar"}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <label className="card__title">
                                            <FontAwesomeIcon icon={faFistRaised} />
                                            Ataques y conjuros
                                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                                        </label>
                                        {weapons.map((w, idx) => (
                                            <WeaponRow
                                                key={w.id}
                                                weapon={w}
                                                onChange={(nw) => {
                                                    const next = [...weapons];
                                                    next[idx] = nw;
                                                    patch({ weapons: next });
                                                }}
                                                onRemove={weaponsEditMode && weapons.length > MIN_WEAPONS ? () => removeWeapon(w.id) : undefined}
                                                annotationsFor={annotationsFor}
                                                setAnnotationsFor={setAnnotationsFor}
                                            />
                                        ))}
                                        <button type="button" className="weaponsList__add" onClick={addWeapon}>
                                            <FontAwesomeIcon icon={faPlus} /> Añadir arma
                                        </button>
                                    </div>



                                    <div className="card">
                                        <label className="card__title">Equipo</label>
                                        {af("Equipment", content.Equipment || "", setField("Equipment"), { rows: 6 })}
                                    </div>

                                    <div className="card">
                                        <label className="card__title">Monedas</label>
                                        <div className="coinRow coinRow--platinum">
                                            <FontAwesomeIcon icon={faCoins} className="coinRow__icon" />
                                            <label>Platino</label>
                                            <input type="text" inputMode="numeric" value={content.Platinum || ""} onChange={(e) => setField("Platinum")(e.target.value)} />
                                        </div>
                                        <div className="coinRow coinRow--gold">
                                            <FontAwesomeIcon icon={faCoins} className="coinRow__icon" />
                                            <label>Oro</label>
                                            <input type="text" inputMode="numeric" value={content.Gold || ""} onChange={(e) => setField("Gold")(e.target.value)} />
                                        </div>
                                        <div className="coinRow coinRow--silver">
                                            <FontAwesomeIcon icon={faCoins} className="coinRow__icon" />
                                            <label>Plata</label>
                                            <input type="text" inputMode="numeric" value={content.Silver || ""} onChange={(e) => setField("Silver")(e.target.value)} />
                                        </div>
                                        <div className="coinRow coinRow--copper">
                                            <FontAwesomeIcon icon={faCoins} className="coinRow__icon" />
                                            <label>Cobre</label>
                                            <input type="text" inputMode="numeric" value={content.Copper || ""} onChange={(e) => setField("Copper")(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="card">
                                        <label className="card__title">Rasgos y dotes</label>
                                        {af("FeaturesAndTraits", content["Features and Traits"] || "", setField("Features and Traits"), { rows: 10 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "personality" && (
                        <div className="sheetPage sheetPage--personality">
                            <div className="sheetHeader__row">
                                {(["Age", "Height", "Weight", "Eyes", "Skin", "Hair"] as const).map((k) => (
                                    <div className="field" key={k}>
                                        <label>{{ Age: "Edad", Height: "Altura", Weight: "Peso", Eyes: "Ojos", Skin: "Piel", Hair: "Pelo" }[k]}</label>
                                        {af(k, content[k] || "", setField(k), { multiline: false })}
                                    </div>
                                ))}
                            </div>

                            <div className="sheetPage__grid sheetPage__grid--personality">
                                <div className="card">
                                    <label className="card__title">Rasgos de personalidad</label>
                                    {af("PersonalityTraits", content.PersonalityTraits || "", setField("PersonalityTraits"), { rows: 4 })}
                                </div>
                                <div className="card">
                                    <label className="card__title">Ideales</label>
                                    {af("Ideals", content.Ideals || "", setField("Ideals"), { rows: 4 })}
                                </div>
                                <div className="card">
                                    <label className="card__title">Vínculos</label>
                                    {af("Bonds", content.Bonds || "", setField("Bonds"), { rows: 4 })}
                                </div>
                                <div className="card">
                                    <label className="card__title">Defectos</label>
                                    {af("Flaws", content.Flaws || "", setField("Flaws"), { rows: 4 })}
                                </div>

                                <div className="card span2">
                                    <label className="card__title">Apariencia del personaje</label>
                                    {af("CharacterAppearance", content.CharacterAppearance || "", setField("CharacterAppearance"), { rows: 6 })}
                                </div>

                                <div className="card span2">
                                    <label className="card__title">Aliados y organizaciones</label>
                                    <div className="field">
                                        <label>Nombre de la organización</label>
                                        {af("OrgName", content["Name group"] || "", setField("Name group"), { multiline: false })}
                                    </div>
                                    {af("Allies", content.Allies || "", setField("Allies"), { rows: 6 })}
                                </div>

                                <div className="card span2">
                                    <label className="card__title">Rasgos y dotes adicionales</label>
                                    {af("AdditionalFeaturesTraits", content.AdditionalFeaturesTraits || "", setField("AdditionalFeaturesTraits"), { rows: 6 })}
                                </div>

                                <div className="card span2">
                                    <label className="card__title">Historia / Notas</label>
                                    {af("CharacterBackstory", content.CharacterBackstory || "", setField("CharacterBackstory"), { rows: 8 })}
                                </div>

                                <div className="card span2">
                                    <label className="card__title">Tesoro</label>
                                    {af("Treasure", content.Treasure || "", setField("Treasure"), { rows: 6 })}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "spells" && (
                        <div className="sheetPage sheetPage--spells">
                            <div className="sheetHeader__row">
                                <div className="field">
                                    <label>Clase de lanzador</label>
                                    {af("SpellcastingClass", spells.spellcastingClass, (v) => setSpells({ ...spells, spellcastingClass: v }), { multiline: false })}
                                </div>
                                <div className="field">
                                    <label>Característica</label>
                                    {af("SpellcastingAbility", spells.spellcastingAbility, (v) => setSpells({ ...spells, spellcastingAbility: v }), { multiline: false })}
                                </div>
                                <div className="field">
                                    <label>CD de salvación</label>
                                    {af("SpellSaveDC", spells.saveDC, (v) => setSpells({ ...spells, saveDC: v }), { multiline: false })}
                                </div>
                                <div className="field">
                                    <label>Bono de ataque</label>
                                    {af("SpellAtkBonus", spells.atkBonus, (v) => setSpells({ ...spells, atkBonus: v }), { multiline: false })}
                                </div>
                            </div>

                            <div className="spellsGrid">
                                <div className="card spellLevelBlock spellLevelBlock--cantrips">
                                    <div className="spellLevelBlock__header">
                                        <span className="spellLevelBlock__num">0</span>
                                        <span>Trucos</span>
                                    </div>
                                    <div className="spellLevelBlock__entries">
                                        {spells.cantrips.map((entry) => (
                                            <SpellEntryRow
                                                key={entry.id}
                                                entry={entry}
                                                onChange={(patch2) => setSpells({ ...spells, cantrips: spells.cantrips.map((c) => (c.id === entry.id ? { ...c, ...patch2 } : c)) })}
                                                onRemove={() => setSpells({ ...spells, cantrips: spells.cantrips.filter((c) => c.id !== entry.id) })}
                                                annotationsFor={annotationsFor}
                                                setAnnotationsFor={setAnnotationsFor}
                                            />
                                        ))}
                                        <button type="button" className="spellLevelBlock__add" onClick={() => setSpells({ ...spells, cantrips: [...spells.cantrips, { id: newId("cantrip"), name: "", prepared: false }] })}>
                                            + Añadir truco
                                        </button>
                                    </div>
                                </div>

                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                                    <div className="card" key={lvl}>
                                        <SpellLevelBlock
                                            level={lvl}
                                            data={spells.levels[lvl]}
                                            onChange={(d) => setSpells({ ...spells, levels: { ...spells.levels, [lvl]: d } })}
                                            annotationsFor={annotationsFor}
                                            setAnnotationsFor={setAnnotationsFor}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


            </div>
            <div className="characterSheetForm__inventoryContainer" ref={inventoryRef}>
                <SectionDisplay
                    title="Inventario"
                    content={inventory}
                    onContentChange={setInventory}
                    items={magicItems}
                    onItemsChange={setMagicItems}
                    itemsCategory="objeto"
                    itemsLabel="Objetos Mágicos"
                    onBeautify={beautifyInventoryMarkdown}
                    enableBeautify={true}
                    createItemLink="/article"
                />
                <SectionDisplay title="Historia del Personaje" content={story} onContentChange={setStory} createItemLink="/article" />
            </div>

            <button
                type="button"
                className={`characterSheetForm__scrollTop ${showScrollTop ? "characterSheetForm__scrollTop--visible" : ""}`}
                onClick={scrollToTop}
                title="Volver arriba"
                aria-label="Volver arriba"
            >
                <FontAwesomeIcon icon={faArrowUp} />
            </button>

            {exportingPdf && (
                <div className="characterSheetForm__pdfOverlay">
                    <Loading text="Generando PDF…" />
                </div>
            )}
        </div>
    );
}
