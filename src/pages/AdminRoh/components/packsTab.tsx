import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createSingleUsePackCode, fetchPackTypes, PackTypeRecord, upsertPackType } from 'services/packTypes';
import { useRohExpansions } from '../useRohExpansions';

type Status = { type: 'success' | 'error'; text: string } | null;

const emptyPack = (): PackTypeRecord => ({
    id: '',
    nombre: '',
    expansion: '',
    tipo: 'normal',
    imagen_url: '',
    orden: 0,
    activo: false,
    precio: null,
    descripcion: '',
});

const NEW_PACK = emptyPack();

const PackForm: React.FC<{ pack: PackTypeRecord; expansions: string[]; isNew?: boolean; onSaved: () => void }> = ({
    pack,
    expansions,
    isNew,
    onSaved,
}) => {
    const [form, setForm] = useState<PackTypeRecord>(pack);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>(null);

    const savedKey = JSON.stringify(pack);

    useEffect(() => setForm(JSON.parse(savedKey)), [savedKey]);

    const update = <K extends keyof PackTypeRecord>(field: K, value: PackTypeRecord[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.id.trim() || !form.nombre.trim() || !form.expansion) {
            setStatus({ type: 'error', text: 'Id, nombre y expansión son obligatorios' });
            return;
        }
        setSaving(true);
        setStatus(null);
        try {
            await upsertPackType({
                ...form,
                id: form.id.trim(),
                nombre: form.nombre.trim(),
                imagen_url: form.imagen_url?.trim() || null,
                descripcion: form.descripcion?.trim() || null,
            });
            setStatus({ type: 'success', text: 'Sobre guardado' });
            if (isNew) setForm(emptyPack());
            onSaved();
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error guardando sobre' });
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        setStatus(null);
        try {
            setCode(await createSingleUsePackCode(form.id));
        } catch (err: any) {
            setStatus({ type: 'error', text: err?.message || 'Error generando código' });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <form className="adminCardForm" onSubmit={handleSave}>
            <h2 className="adminRohPage__formTitle">{isNew ? 'Nuevo sobre' : pack.nombre}</h2>
            <div className="adminCardForm__row">
                <div className="adminCardForm__group">
                    <label>Id</label>
                    <input value={form.id} disabled={!isNew} onChange={(e) => update('id', e.target.value)} />
                </div>
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} />
                </div>
                <div className="adminCardForm__group">
                    <label>Expansión</label>
                    <select value={form.expansion} onChange={(e) => update('expansion', e.target.value)}>
                        <option value="">Selecciona...</option>
                        {expansions.map((expansion) => <option key={expansion} value={expansion}>{expansion}</option>)}
                    </select>
                </div>
                <div className="adminCardForm__group">
                    <label>Tipo</label>
                    <select value={form.tipo} onChange={(e) => update('tipo', e.target.value as PackTypeRecord['tipo'])}>
                        <option value="normal">Normal</option>
                        <option value="legendario">Legendario</option>
                    </select>
                </div>
            </div>
            <div className="adminCardForm__row">
                <div className="adminCardForm__group">
                    <label>Precio (monedas)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="Sin precio"
                        value={form.precio ?? ''}
                        onChange={(e) => update('precio', e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                </div>
                <div className="adminCardForm__group">
                    <label>Orden</label>
                    <input
                        type="number"
                        value={form.orden}
                        onChange={(e) => update('orden', parseInt(e.target.value, 10) || 0)}
                    />
                </div>
                <div className="adminCardForm__group adminCardForm__group--grow">
                    <label>Imagen (URL o ruta)</label>
                    <input value={form.imagen_url || ''} onChange={(e) => update('imagen_url', e.target.value)} />
                </div>
                <label className="adminCardForm__group adminCardForm__checkbox">
                    <input type="checkbox" checked={form.activo} onChange={(e) => update('activo', e.target.checked)} />
                    Activo
                </label>
            </div>
            <div className="adminCardForm__group">
                <label>Descripción (una línea por párrafo)</label>
                <textarea value={form.descripcion || ''} onChange={(e) => update('descripcion', e.target.value)} />
            </div>
            <div className="adminCardForm__actions">
                <button type="submit" className="adminCardForm__submit" disabled={saving}>
                    {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                    Guardar
                </button>
                {!isNew && (
                    <button type="button" className="adminCardForm__cancelButton" onClick={handleGenerateCode} disabled={generating}>
                        <FontAwesomeIcon icon={generating ? faSpinner : faKey} spin={generating} />
                        Generar código ROH (1 uso)
                    </button>
                )}
                {code && (
                    <button
                        type="button"
                        className="adminRohPage__code"
                        onClick={() => navigator.clipboard.writeText(code)}
                        title="Copiar código"
                    >
                        {code}
                        <FontAwesomeIcon icon={faCopy} />
                    </button>
                )}
            </div>
            {status && <div className={`adminCardForm__notice adminCardForm__notice--${status.type}`}>{status.text}</div>}
        </form>
    );
};

const PacksTab: React.FC = () => {
    const { expansions } = useRohExpansions();
    const [packs, setPacks] = useState<PackTypeRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        fetchPackTypes({ force: true })
            .then(setPacks)
            .catch((err) => setError(err?.message || 'Error cargando sobres'));
    };

    useEffect(load, []);

    const expansionNames = expansions.map((expansion) => expansion.expansion);

    return (
        <div className="adminRohPage__section">
            {error && <div className="adminCardForm__notice adminCardForm__notice--error">{error}</div>}
            {packs.map((pack) => (
                <PackForm key={pack.id} pack={pack} expansions={expansionNames} onSaved={load} />
            ))}
            <PackForm pack={NEW_PACK} expansions={expansionNames} isNew onSaved={load} />
        </div>
    );
};

export default PacksTab;
