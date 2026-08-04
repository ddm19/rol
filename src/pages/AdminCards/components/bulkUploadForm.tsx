import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { AdminCardInput, normalizeKey, uploadCardImage, upsertCardFull } from 'services/cardsService';

type RowStatus = 'pending' | 'uploading' | 'saving' | 'done' | 'error';

type Row = {
    card: AdminCardInput;
    matchedFile: File | null;
    status: RowStatus;
    message?: string;
};

function normalizeBulkEntry(raw: any): AdminCardInput | null {
    if (!raw || typeof raw !== 'object') return null;
    const id_archivo = String(raw.id_archivo || '').trim();
    const nombre = String(raw.nombre || '').trim();
    if (!id_archivo || !nombre) return null;

    return {
        id_archivo,
        nombre,
        coste: raw.coste ?? '0',
        iniciativa: raw.iniciativa ?? '',
        tipos: Array.isArray(raw.tipos) ? raw.tipos : [],
        efecto: raw.efecto ?? '',
        texto_ambientacion: raw.texto_ambientacion ?? '',
        color: raw.color ?? null,
        color2: raw.color2 ?? null,
        expansion: raw.expansion ?? '',
        rareza: raw.rareza ?? '',
        imagen_url: raw.imagen_url ?? '',
        estadisticas: raw.estadisticas
            ? {
                ataque: raw.estadisticas.ataque,
                dano_purga: raw.estadisticas.dano_purga,
                vida: raw.estadisticas.vida,
            }
            : null,
    };
}

const statusIcon: Record<RowStatus, any> = {
    pending: null,
    uploading: faSpinner,
    saving: faSpinner,
    done: faCheck,
    error: faXmark,
};

const BulkUploadForm: React.FC = () => {
    const [rows, setRows] = useState<Row[]>([]);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);


    useEffect(() => {
        const preventDefault = (e: DragEvent) => e.preventDefault();
        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);
        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    const imageMap = useMemo(() => {
        const map = new Map<string, File>();
        imageFiles.forEach((f) => {
            const base = f.name.replace(/\.[^./]+$/, '');
            map.set(normalizeKey(base), f);
        });
        return map;
    }, [imageFiles]);

    const rowsWithMatches = useMemo(
        () =>
            rows.map((row) => {
                if (row.matchedFile) return row;
                const match = imageMap.get(normalizeKey(row.card.id_archivo)) || imageMap.get(normalizeKey(row.card.nombre)) || null;
                return { ...row, matchedFile: match };
            }),
        [rows, imageMap]
    );

    const processJsonFile = async (file: File | null) => {
        setJsonError(null);
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error('El JSON debe ser un array de cartas.');

            const validRows: Row[] = [];
            let skipped = 0;
            parsed.forEach((raw) => {
                const card = normalizeBulkEntry(raw);
                if (!card) {
                    skipped += 1;
                    return;
                }
                validRows.push({ card, matchedFile: null, status: 'pending' });
            });

            if (validRows.length === 0) throw new Error('No se encontraron cartas válidas (requieren id_archivo y nombre).');

            setRows(validRows);
            if (skipped > 0) {
                setJsonError(`Se ignoraron ${skipped} entradas sin id_archivo o nombre.`);
            }
        } catch (err: any) {
            setRows([]);
            setJsonError(err?.message || 'No se pudo leer el archivo JSON.');
        }
    };

    const handleJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        processJsonFile(e.target.files?.[0] || null);
    };

    const [isDraggingJson, setIsDraggingJson] = useState(false);

    const jsonDropHandlers = {
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingJson(true); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingJson(true); },
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingJson(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingJson(false);
            processJsonFile(e.dataTransfer.files?.[0] || null);
        },
    };

    const processImageFiles = (files: FileList | File[] | null) => {
        if (!files || files.length === 0) return;
        setImageFiles(Array.from(files));
    };

    const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        processImageFiles(e.target.files);
    };

    const [isDraggingImages, setIsDraggingImages] = useState(false);

    const imagesDropHandlers = {
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImages(true); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImages(true); },
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImages(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingImages(false);
            processImageFiles(e.dataTransfer.files);
        },
    };

    const updateRow = (index: number, patch: Partial<Row>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const processAll = async () => {
        setProcessing(true);
        for (let i = 0; i < rowsWithMatches.length; i++) {
            const row = rowsWithMatches[i];
            updateRow(i, { status: 'uploading', matchedFile: row.matchedFile });
            try {
                let imagen_url = row.card.imagen_url || '';
                if (row.matchedFile) {
                    imagen_url = await uploadCardImage(row.matchedFile, row.card.id_archivo);
                }
                updateRow(i, { status: 'saving' });
                await upsertCardFull({ ...row.card, imagen_url });
                updateRow(i, { status: 'done' });
            } catch (err: any) {
                updateRow(i, { status: 'error', message: err?.message || 'Error desconocido' });
            }
        }
        setProcessing(false);
    };

    const summary = useMemo(() => {
        const done = rows.filter((r) => r.status === 'done').length;
        const errors = rows.filter((r) => r.status === 'error').length;
        const withoutImage = rowsWithMatches.filter((r) => !r.matchedFile && !r.card.imagen_url).length;
        return { done, errors, withoutImage, total: rows.length };
    }, [rows, rowsWithMatches]);

    return (
        <div className="adminCardBulk">
            <div className="adminCardBulk__inputs">
                <div
                    className={`adminCardForm__group adminCardForm__dropZone${isDraggingJson ? ' is-dragging' : ''}`}
                    {...jsonDropHandlers}
                >
                    <label htmlFor="bulk-json">Archivo JSON con las cartas — o arrástralo aquí</label>
                    <input id="bulk-json" type="file" accept="application/json" onChange={handleJsonFile} />
                </div>
                <div
                    className={`adminCardForm__group adminCardForm__dropZone${isDraggingImages ? ' is-dragging' : ''}`}
                    {...imagesDropHandlers}
                >
                    <label htmlFor="bulk-images">Imágenes (PNG, selección múltiple) — o arrástralas aquí</label>
                    <input id="bulk-images" type="file" accept="image/png" multiple onChange={handleImageFiles} />
                </div>
            </div>

            {jsonError && <div className="adminCardForm__notice adminCardForm__notice--error">{jsonError}</div>}

            {rows.length > 0 && (
                <>
                    <div className="adminCardBulk__summary">
                        <span>{rows.length} cartas cargadas</span>
                        <span>{imageFiles.length} imágenes seleccionadas</span>
                        {summary.withoutImage > 0 && (
                            <span className="adminCardBulk__warning">
                                <FontAwesomeIcon icon={faTriangleExclamation} /> {summary.withoutImage} sin imagen coincidente
                            </span>
                        )}
                    </div>

                    <div className="adminCardBulk__tableWrapper">
                        <table className="adminCardBulk__table">
                            <thead>
                                <tr>
                                    <th>id_archivo</th>
                                    <th>Nombre</th>
                                    <th>Imagen</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsWithMatches.map((row, i) => (
                                    <tr key={row.card.id_archivo + i}>
                                        <td>{row.card.id_archivo}</td>
                                        <td>{row.card.nombre}</td>
                                        <td>
                                            {row.matchedFile
                                                ? row.matchedFile.name
                                                : row.card.imagen_url
                                                    ? 'URL existente'
                                                    : '—'}
                                        </td>
                                        <td className={`adminCardBulk__status adminCardBulk__status--${row.status}`}>
                                            {statusIcon[row.status] && (
                                                <FontAwesomeIcon icon={statusIcon[row.status]} spin={row.status === 'uploading' || row.status === 'saving'} />
                                            )}
                                            {row.status === 'error' ? row.message : row.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button type="button" className="adminCardForm__submit" disabled={processing} onClick={processAll}>
                        <FontAwesomeIcon icon={processing ? faSpinner : faCheck} spin={processing} />
                        <span>{processing ? 'Procesando...' : `Procesar ${rows.length} cartas`}</span>
                    </button>

                    {(summary.done > 0 || summary.errors > 0) && !processing && (
                        <div className="adminCardForm__notice adminCardForm__notice--success">
                            {summary.done} guardadas correctamente, {summary.errors} con errores.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BulkUploadForm;
