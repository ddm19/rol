import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TextAnnotation, newId } from "../types";
import { getSelectionOffsets, resolveAnnotations } from "./annotationUtils";

type FormatKind = "bold" | "italic" | "underline";

const FORMAT_TAGS: Record<string, FormatKind> = { B: "bold", STRONG: "bold", I: "italic", EM: "italic", U: "underline" };

const FORMAT_ELEMENT: Record<FormatKind, string> = { bold: "strong", italic: "em", underline: "u" };

// Reads editable content as plain text (treating <br> as "\n"), while also collecting
// the ranges wrapped in bold/italic/underline tags - these come from the browser's own
// native formatting shortcuts (Ctrl+B, the mobile selection toolbar, etc.), which apply
// directly to the DOM without going through our annotation state.
function extractContent(el: HTMLElement): { text: string; formats: { type: FormatKind; start: number; end: number }[] } {
    let text = "";
    const formats: { type: FormatKind; start: number; end: number }[] = [];
    const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent || "";
            return;
        }
        if (node.nodeName === "BR") {
            text += "\n";
            return;
        }
        const type = FORMAT_TAGS[node.nodeName];
        const start = text.length;
        node.childNodes.forEach(walk);
        if (type) formats.push({ type, start, end: text.length });
    };
    el.childNodes.forEach(walk);
    return { text, formats };
}

// Inverse of the text side of extractContent: splits on "\n" and inserts <br> elements between lines.
function pushTextWithBreaks(nodes: Node[], text: string) {
    const lines = text.split("\n");
    lines.forEach((line, i) => {
        if (i > 0) nodes.push(document.createElement("br"));
        if (line.length > 0) nodes.push(document.createTextNode(line));
    });
}

interface AnnotatedFieldProps {
    fieldId: string;
    value: string;
    onValueChange: (v: string) => void;
    annotations: TextAnnotation[];
    onAnnotationsChange: (a: TextAnnotation[]) => void;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    className?: string;
}

interface Pill {
    x: number;
    y: number;
    start: number;
    end: number;
    mobile: boolean;
}

interface Bubble {
    annotationId: string;
    isNew: boolean;
    x: number;
    y: number;
    mobile: boolean;
}

export default function AnnotatedField({
    fieldId,
    value,
    onValueChange,
    annotations,
    onAnnotationsChange,
    placeholder,
    multiline = true,
    rows = 3,
    className,
}: AnnotatedFieldProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastEmitted = useRef<string>(value);
    const [pill, setPill] = useState<Pill | null>(null);
    const [bubble, setBubble] = useState<Bubble | null>(null);
    const [draftNote, setDraftNote] = useState("");
    const [isEmpty, setIsEmpty] = useState(value.trim() === "");

    const resolved = resolveAnnotations(value, annotations);
    const orphaned = resolved.filter((r) => r.orphaned && (!r.kind || r.kind === "note"));

    const rebuild = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const nodes: Node[] = [];
        let cursor = 0;
        for (const a of resolved.filter((r) => !r.orphaned).sort((x, y) => x.start - y.start)) {
            if (a.start > cursor) pushTextWithBreaks(nodes, value.slice(cursor, a.start));
            const isFormat = a.kind && a.kind !== "note";
            const wrapper = document.createElement(isFormat ? FORMAT_ELEMENT[a.kind as FormatKind] : "mark");
            if (!isFormat) {
                wrapper.dataset.annotationId = a.id;
                wrapper.className = "annotatedField__mark";
            }
            const wrapperNodes: Node[] = [];
            pushTextWithBreaks(wrapperNodes, value.slice(a.start, a.end));
            wrapperNodes.forEach((n) => wrapper.appendChild(n));
            nodes.push(wrapper);
            cursor = a.end;
        }
        if (cursor < value.length) pushTextWithBreaks(nodes, value.slice(cursor));
        el.replaceChildren(...nodes);
        setIsEmpty(value.trim() === "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, annotations]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (document.activeElement === el && lastEmitted.current === value) return;
        rebuild();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [annotations, value]);

    useEffect(() => {
        rebuild();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The DOM is the source of truth for formatting while the field is focused (the browser
    // applies bold/italic/underline directly via native shortcuts). On every keystroke we
    // reconcile that against the persisted annotation list so the formatting survives blur.
    const syncFormatting = (text: string, formats: { type: FormatKind; start: number; end: number }[]) => {
        const prevFormats = annotations
            .filter((a) => a.kind && a.kind !== "note")
            .map((a) => ({ type: a.kind as FormatKind, start: a.start, end: a.end }))
            .sort((a, b) => a.start - b.start || a.type.localeCompare(b.type));
        const nextFormats = [...formats].sort((a, b) => a.start - b.start || a.type.localeCompare(b.type));
        const same =
            prevFormats.length === nextFormats.length &&
            prevFormats.every((f, i) => f.type === nextFormats[i].type && f.start === nextFormats[i].start && f.end === nextFormats[i].end);
        if (same) return;
        const noteAnnotations = annotations.filter((a) => !a.kind || a.kind === "note");
        const formatAnnotations: TextAnnotation[] = formats.map((f) => ({
            id: newId(f.type),
            start: f.start,
            end: f.end,
            anchorText: text.slice(f.start, f.end),
            note: "",
            kind: f.type,
        }));
        onAnnotationsChange([...noteAnnotations, ...formatAnnotations]);
    };

    const handleInput = () => {
        const el = containerRef.current;
        if (!el) return;
        const { text, formats } = extractContent(el);
        lastEmitted.current = text;
        setIsEmpty(text.trim() === "");
        onValueChange(text);
        syncFormatting(text, formats);
    };

    const handleBlur = () => {
        rebuild();
        setPill(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (!multiline) return;
        document.execCommand("insertLineBreak");
        handleInput();
    };

    const evaluateSelection = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const sel = getSelectionOffsets(el);
        if (!sel || sel.start === sel.end) {
            setPill(null);
            return;
        }
        const overlapsExisting = resolved.some((r) => !r.orphaned && sel.start < r.end && sel.end > r.start);
        if (overlapsExisting) {
            setPill(null);
            return;
        }
        const range = window.getSelection()?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (!rect) return;
        setPill({ x: rect.left + rect.width / 2, y: rect.top, start: sel.start, end: sel.end, mobile: window.innerWidth < 600 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolved]);

    const handleMouseUp = () => evaluateSelection();

    useEffect(() => {
        const handleSelectionChange = () => {
            if (window.innerWidth >= 600) return;
            const el = containerRef.current;
            if (!el) return;
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                setPill(null);
                return;
            }
            if (!el.contains(sel.getRangeAt(0).commonAncestorContainer)) return;
            evaluateSelection();
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [evaluateSelection]);

    const openNewBubble = () => {
        if (!pill) return;
        const mobile = window.innerWidth < 600;
        const id = newId("note");
        const anchorText = value.slice(pill.start, pill.end);
        onAnnotationsChange([...annotations, { id, start: pill.start, end: pill.end, anchorText, note: "", kind: "note" }]);
        setDraftNote("");
        setBubble({ annotationId: id, isNew: true, x: pill.x, y: pill.y, mobile });
        setPill(null);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const mark = target.closest("mark[data-annotation-id]") as HTMLElement | null;
        if (!mark) return;
        const id = mark.dataset.annotationId!;
        const existing = annotations.find((a) => a.id === id);
        if (!existing) return;
        const rect = mark.getBoundingClientRect();
        const mobile = window.innerWidth < 600;
        setDraftNote(existing.note);
        setBubble({ annotationId: id, isNew: false, x: rect.left + rect.width / 2, y: rect.bottom, mobile });
    };

    const saveBubble = () => {
        if (!bubble) return;
        onAnnotationsChange(annotations.map((a) => (a.id === bubble.annotationId ? { ...a, note: draftNote } : a)));
        setBubble(null);
    };

    const deleteBubble = () => {
        if (!bubble) return;
        onAnnotationsChange(annotations.filter((a) => a.id !== bubble.annotationId));
        setBubble(null);
    };

    const removeOrphan = (id: string) => {
        onAnnotationsChange(annotations.filter((a) => a.id !== id));
    };

    return (
        <div className={`annotatedField ${className || ""}`}>
            <div className="annotatedField__wrapper">
                <div
                    ref={containerRef}
                    className={`annotatedField__editable ${multiline ? "annotatedField__editable--multi" : "annotatedField__editable--single"}`}
                    style={multiline ? { minHeight: `${rows * 1.4}em` } : undefined}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onBlur={handleBlur}
                    onMouseUp={handleMouseUp}
                    onKeyUp={handleMouseUp}
                    onKeyDown={handleKeyDown}
                    onClick={handleContainerClick}
                    data-field-id={fieldId}
                />
                {isEmpty && placeholder && <span className="annotatedField__placeholder">{placeholder}</span>}
            </div>

            {orphaned.length > 0 && (
                <div className="annotatedField__orphans">
                    {orphaned.map((o) => (
                        <span key={o.id} className="annotatedField__orphan" title="El texto al que estaba anclada esta nota ya no existe tal cual">
                            <FontAwesomeIcon icon={faStickyNote} /> {o.note || "(nota vacía)"}
                            <button type="button" onClick={() => removeOrphan(o.id)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {pill && (
                <button
                    type="button"
                    className={`annotatedField__pill ${pill.mobile ? "annotatedField__pill--mobile" : ""}`}
                    style={pill.mobile ? undefined : { left: pill.x, top: pill.y }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openNewBubble}
                >
                    <FontAwesomeIcon icon={faStickyNote} /> Añadir Nota
                </button>
            )}

            {bubble && (
                <>
                    <div className="annotatedField__scrim" onClick={() => (bubble.isNew && draftNote.trim() === "" ? deleteBubble() : saveBubble())} />
                    <div className={`annotatedField__bubble ${bubble.mobile ? "annotatedField__bubble--sheet" : ""}`} style={bubble.mobile ? undefined : { left: bubble.x, top: bubble.y }}>
                        <div className="annotatedField__bubbleHeader">
                            <FontAwesomeIcon icon={faStickyNote} /> Nota oculta
                        </div>
                        <textarea autoFocus value={draftNote} onChange={(e) => setDraftNote(e.target.value)} rows={3} placeholder="Escribe la nota..." />
                        <div className="annotatedField__bubbleActions">
                            <button type="button" className="annotatedField__bubbleDelete" onClick={deleteBubble}>
                                <FontAwesomeIcon icon={faTrash} /> Eliminar
                            </button>
                            <button type="button" className="annotatedField__bubbleSave" onClick={saveBubble}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
