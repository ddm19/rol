import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import ColorPicker from './colorPicker';
import {
    AdminCardInput,
    CardDTO,
    deleteCardFull,
    fetchFacets,
    uploadCardImage,
    upsertCardFull,
} from 'services/cardsService';

type FormState = AdminCardInput & { ataque: string; dano_purga: string; vida: string; tieneEstadisticas: boolean };

const emptyForm = (): FormState => ({
    id_archivo: '',
    nombre: '',
    coste: '0',
    iniciativa: '',
    tipos: [],
    efecto: '',
    texto_ambientacion: '',
    color: null,
    color2: null,
    expansion: '',
    rareza: '',
    imagen_url: '',
    tieneEstadisticas: false,
    ataque: '',
    dano_purga: '',
    vida: '',
});

const formFromCard = (card: CardDTO): FormState => ({
    id_archivo: card.id_archivo,
    nombre: card.nombre,
    coste: String(card.coste ?? '0'),
    iniciativa: card.iniciativa ?? '',
    tipos: card.types || [],
    efecto: card.efecto ?? '',
    texto_ambientacion: card.texto_ambientacion ?? '',
    color: card.color ?? null,
    color2: card.color2 ?? null,
    expansion: card.expansion ?? '',
    rareza: card.rareza ?? '',
    imagen_url: card.imagen_url ?? '',
    tieneEstadisticas: !!card.stats,
    ataque: card.stats?.ataque != null ? String(card.stats.ataque) : '',
    dano_purga: card.stats?.dano_purga != null ? String(card.stats.dano_purga) : '',
    vida: card.stats?.vida != null ? String(card.stats.vida) : '',
});

type Props = {
    initialCard?: CardDTO;
    onSaved?: () => void;
    onCancel?: () => void;
};

const SingleCardForm: React.FC<Props> = ({ initialCard, onSaved, onCancel }) => {
    const isEditing = !!initialCard;
    const [form, setForm] = useState<FormState>(() => (initialCard ? formFromCard(initialCard) : emptyForm()));
    const [tiposText, setTiposText] = useState(() => (initialCard ? (initialCard.types || []).join(', ') : ''));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [expansions, setExpansions] = useState<string[]>([]);
    const [rarezas, setRarezas] = useState<string[]>([]);
    const [tiposSugeridos, setTiposSugeridos] = useState<string[]>([]);

    useEffect(() => {
        fetchFacets()
            .then((f: any) => {
                setExpansions(f.expansions || []);
                setRarezas(f.rarezas || []);
                setTiposSugeridos(f.tipos || []);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!initialCard) return;
        setForm(formFromCard(initialCard));
        setTiposText((initialCard.types || []).join(', '));
        setImageFile(null);
        setStatus(null);
    }, [initialCard]);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const field = (name: keyof FormState) => ({
        value: (form as any)[name] ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [name]: e.target.value })),
    });

    const processImageFile = (file: File | null) => {
        if (file && file.type !== 'image/png') {
            setStatus({ type: 'error', text: 'La imagen debe ser un archivo PNG.' });
            return;
        }
        setImageFile(file);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        processImageFile(e.target.files?.[0] || null);
    };

    const [isDraggingImage, setIsDraggingImage] = useState(false);

    useEffect(() => {
        const preventDefault = (e: DragEvent) => e.preventDefault();
        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);
        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    const imageDropHandlers = {
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImage(true); },
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImage(true); },
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImage(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingImage(false);
            processImageFile(e.dataTransfer.files?.[0] || null);
        },
    };

    const resetForKeepingContext = () => {
        setForm((prev) => ({
            ...emptyForm(),
            expansion: prev.expansion,
            rareza: prev.rareza,
        }));
        setTiposText('');
        setImageFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!form.id_archivo.trim() || !form.nombre.trim() || !form.efecto.trim()) {
            setStatus({ type: 'error', text: 'id_archivo, nombre y efecto son obligatorios.' });
            return;
        }

        setSubmitting(true);
        try {
            let imagen_url = form.imagen_url || '';
            if (imageFile) {
                imagen_url = await uploadCardImage(imageFile, form.id_archivo.trim());
            }

            const tipos = tiposText.split(',').map((t) => t.trim()).filter(Boolean);

            await upsertCardFull({
                id_archivo: form.id_archivo,
                nombre: form.nombre,
                coste: form.coste,
                iniciativa: form.iniciativa,
                tipos,
                efecto: form.efecto,
                texto_ambientacion: form.texto_ambientacion,
                color: form.color,
                color2: form.color2,
                expansion: form.expansion,
                rareza: form.rareza,
                imagen_url,
                estadisticas: form.tieneEstadisticas
                    ? { ataque: form.ataque, dano_purga: form.dano_purga, vida: form.vida }
                    : null,
            });

            if (isEditing) {
                setStatus({ type: 'success', text: `Carta "${form.nombre}" actualizada correctamente.` });
                onSaved?.();
            } else {
                setStatus({ type: 'success', text: `Carta "${form.nombre}" guardada correctamente.` });
                resetForKeepingContext();
            }
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error desconocido al guardar la carta.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!initialCard) return;
        if (!window.confirm(`¿Eliminar la carta "${initialCard.nombre}"? Esta acción no se puede deshacer.`)) return;

        setDeleting(true);
        setStatus(null);
        try {
            await deleteCardFull(initialCard.id_archivo);
            onSaved?.();
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error al eliminar la carta.' });
        } finally {
            setDeleting(false);
        }
    };

    const previewSrc = imagePreview || form.imagen_url || null;

    return (
        <form className="adminCardForm" onSubmit={handleSubmit}>
            {status && (
                <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>
            )}

            <div className="adminCardForm__row">
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="id_archivo">id_archivo *</label>
                    <input
                        id="id_archivo"
                        required
                        {...field('id_archivo')}
                        readOnly={isEditing}
                        disabled={isEditing}
                        placeholder="Ej: Bibliotecaria de castilla"
                    />
                </div>
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="nombre">Nombre *</label>
                    <input id="nombre" required {...field('nombre')} placeholder="Ej: Bibliotecaria de Castilla" />
                </div>
            </div>

            <div className="adminCardForm__row">
                <div className="adminCardForm__group">
                    <label htmlFor="coste">Coste</label>
                    <input id="coste" type="number" min={0} {...field('coste')} />
                </div>
                <div className="adminCardForm__group">
                    <label htmlFor="iniciativa">Iniciativa</label>
                    <input id="iniciativa" {...field('iniciativa')} placeholder="Ej: 4" />
                </div>
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="tipos">Tipos (separados por coma)</label>
                    <input
                        id="tipos"
                        list="tipos-sugeridos"
                        value={tiposText}
                        onChange={(e) => setTiposText(e.target.value)}
                        placeholder="Ej: Criatura, Humano"
                    />
                    <datalist id="tipos-sugeridos">
                        {tiposSugeridos.map((t) => <option key={t} value={t} />)}
                    </datalist>
                </div>
            </div>

            <div className="adminCardForm__group">
                <label htmlFor="efecto">Efecto *</label>
                <textarea id="efecto" required {...field('efecto')} />
            </div>

            <div className="adminCardForm__group">
                <label htmlFor="texto_ambientacion">Texto de ambientación</label>
                <textarea id="texto_ambientacion" {...field('texto_ambientacion')} />
            </div>

            <div className="adminCardForm__row">
                <ColorPicker label="Color 1" value={form.color ?? null} onChange={(v) => setForm((p) => ({ ...p, color: v }))} />
                <ColorPicker label="Color 2" value={form.color2 ?? null} onChange={(v) => setForm((p) => ({ ...p, color2: v }))} />
            </div>

            <div className="adminCardForm__row">
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="expansion">Expansión</label>
                    <input id="expansion" list="expansiones-sugeridas" {...field('expansion')} />
                    <datalist id="expansiones-sugeridas">
                        {expansions.map((t) => <option key={t} value={t} />)}
                    </datalist>
                </div>
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label htmlFor="rareza">Rareza</label>
                    <input id="rareza" list="rarezas-sugeridas" {...field('rareza')} />
                    <datalist id="rarezas-sugeridas">
                        {rarezas.map((t) => <option key={t} value={t} />)}
                    </datalist>
                </div>
            </div>

            <div className="adminCardForm__group">
                <label className="adminCardForm__checkbox">
                    <input
                        type="checkbox"
                        checked={form.tieneEstadisticas}
                        onChange={(e) => setForm((p) => ({ ...p, tieneEstadisticas: e.target.checked }))}
                    />
                    Esta carta tiene estadísticas de criatura
                </label>
            </div>

            {form.tieneEstadisticas && (
                <div className="adminCardForm__row adminCardForm__stats">
                    <div className="adminCardForm__group">
                        <label htmlFor="ataque">Ataque</label>
                        <input id="ataque" {...field('ataque')} />
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="dano_purga">Purgar</label>
                        <input id="dano_purga" {...field('dano_purga')} />
                    </div>
                    <div className="adminCardForm__group">
                        <label htmlFor="vida">Vida</label>
                        <input id="vida" {...field('vida')} />
                    </div>
                </div>
            )}

            <div
                className={`adminCardForm__group adminCardForm__dropZone${isDraggingImage ? ' is-dragging' : ''}`}
                {...imageDropHandlers}
            >
                <label htmlFor="imagen">Imagen (PNG){isEditing ? ' — deja vacío para mantener la actual' : ''} — o arrástrala aquí</label>
                <input id="imagen" type="file" accept="image/png" onChange={handleFile} />
                {previewSrc && (
                    <img className="adminCardForm__preview" src={previewSrc} alt="Vista previa" />
                )}
            </div>

            <div className="adminCardForm__actions">
                <button type="submit" className="adminCardForm__submit" disabled={submitting || deleting}>
                    <FontAwesomeIcon icon={submitting ? faSpinner : faUpload} spin={submitting} />
                    <span>{submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar carta'}</span>
                </button>

                {isEditing && (
                    <>
                        <button
                            type="button"
                            className="adminCardForm__deleteButton"
                            disabled={submitting || deleting}
                            onClick={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTrash} spin={deleting} />
                            <span>{deleting ? 'Eliminando...' : 'Eliminar carta'}</span>
                        </button>

                        {onCancel && (
                            <button type="button" className="adminCardForm__cancelButton" onClick={onCancel} disabled={submitting || deleting}>
                                Cancelar
                            </button>
                        )}
                    </>
                )}
            </div>
        </form>
    );
};

export default SingleCardForm;
