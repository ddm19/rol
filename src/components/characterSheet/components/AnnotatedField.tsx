import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TextAnnotation, newId } from "../types";
import { getSelectionOffsets, resolveAnnotations } from "./annotationUtils";

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
    const orphaned = resolved.filter((r) => r.orphaned);

    const rebuild = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const nodes: Node[] = [];
        let cursor = 0;
        for (const a of resolved.filter((r) => !r.orphaned).sort((x, y) => x.start - y.start)) {
            if (a.start > cursor) nodes.push(document.createTextNode(value.slice(cursor, a.start)));
            const mark = document.createElement("mark");
            mark.dataset.annotationId = a.id;
            mark.className = "annotatedField__mark";
            mark.appendChild(document.createTextNode(value.slice(a.start, a.end)));
            nodes.push(mark);
            cursor = a.end;
        }
        if (cursor < value.length) nodes.push(document.createTextNode(value.slice(cursor)));
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

    const handleInput = () => {
        const el = containerRef.current;
        if (!el) return;
        const text = el.textContent || "";
        lastEmitted.current = text;
        setIsEmpty(text.trim() === "");
        onValueChange(text);
    };

    const handleBlur = () => {
        rebuild();
        setPill(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") e.preventDefault();
    };

    const handleMouseUp = () => {
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
        setPill({ x: rect.left + rect.width / 2, y: rect.top, start: sel.start, end: sel.end });
    };

    const openNewBubble = () => {
        if (!pill) return;
        const mobile = window.innerWidth < 600;
        const id = newId("note");
        const anchorText = value.slice(pill.start, pill.end);
        onAnnotationsChange([...annotations, { id, start: pill.start, end: pill.end, anchorText, note: "" }]);
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
                    className="annotatedField__pill"
                    style={{ left: pill.x, top: pill.y }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openNewBubble}
                >
                    <FontAwesomeIcon icon={faStickyNote} /> Nota
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
