import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Ability, abilityMod, fmtMod, SkillDef, WeaponEntry, SpellEntry, SpellLevelData, TextAnnotation } from "../types";
import AnnotatedField from "./AnnotatedField";

export type AnnotationsFor = (fieldId: string) => TextAnnotation[];
export type SetAnnotationsFor = (fieldId: string, list: TextAnnotation[]) => void;

// ---------- Ability score box ----------
export function AbilityBox({
    label,
    score,
    savePROF,
    profBonus,
    onScoreChange,
    onSaveProfChange,
}: {
    label: string;
    score: string;
    savePROF: boolean;
    profBonus: number;
    onScoreChange: (v: string) => void;
    onSaveProfChange: (v: boolean) => void;
}) {
    const mod = abilityMod(score);
    const saveMod = mod + (savePROF ? profBonus : 0);
    return (
        <div className="abilityBox">
            <>
                <div className="abilityBox__label">{label}</div>
                <div className="abilityBox__mod">{fmtMod(mod)}</div>
                <input className="abilityBox__score" type="number" value={score} onChange={(e) => onScoreChange(e.target.value)} />
            </>
            <label className="abilityBox__save">
                <input type="checkbox" checked={savePROF} onChange={(e) => onSaveProfChange(e.target.checked)} />
                <div>Salvación <span className="abilityBox__saveMod">{fmtMod(saveMod)}</span></div>
            </label>
        </div>
    );
}

// ---------- Skill row ----------
export function SkillRow({
    def,
    score,
    proficient,
    profBonus,
    onProfChange,
}: {
    def: SkillDef;
    score: string;
    proficient: boolean;
    profBonus: number;
    onProfChange: (v: boolean) => void;
}) {
    const mod = abilityMod(score) + (proficient ? profBonus : 0);
    return (
        <label className="skillRow">
            <input type="checkbox" checked={proficient} onChange={(e) => onProfChange(e.target.checked)} />
            <span className="skillRow__mod">{fmtMod(mod)}</span>
            <span className="skillRow__label">{def.label}</span>
            <span className="skillRow__ability">({def.ability})</span>
        </label>
    );
}

// ---------- Weapon / attack row ----------
export function WeaponRow({
    idx,
    weapon,
    onChange,
    annotationsFor,
    setAnnotationsFor,
}: {
    idx: number;
    weapon: WeaponEntry;
    onChange: (w: WeaponEntry) => void;
    annotationsFor: AnnotationsFor;
    setAnnotationsFor: SetAnnotationsFor;
}) {
    return (
        <div className="weaponRow">
            <AnnotatedField
                fieldId={`weapon_${idx}_name`}
                multiline={false}
                placeholder="Nombre"
                value={weapon.name}
                onValueChange={(v) => onChange({ ...weapon, name: v })}
                annotations={annotationsFor(`weapon_${idx}_name`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${idx}_name`, list)}
            />
            <AnnotatedField
                fieldId={`weapon_${idx}_atk`}
                multiline={false}
                placeholder="Bono ataque"
                value={weapon.atkBonus}
                onValueChange={(v) => onChange({ ...weapon, atkBonus: v })}
                annotations={annotationsFor(`weapon_${idx}_atk`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${idx}_atk`, list)}
            />
            <AnnotatedField
                fieldId={`weapon_${idx}_dmg`}
                multiline={false}
                placeholder="Daño/Tipo"
                value={weapon.damage}
                onValueChange={(v) => onChange({ ...weapon, damage: v })}
                annotations={annotationsFor(`weapon_${idx}_dmg`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${idx}_dmg`, list)}
            />
        </div>
    );
}

// ---------- Spell entry row  ----------
export function SpellEntryRow({
    entry,
    onChange,
    onRemove,
    annotationsFor,
    setAnnotationsFor,
}: {
    entry: SpellEntry;
    onChange: (patch: Partial<SpellEntry>) => void;
    onRemove: () => void;
    annotationsFor: AnnotationsFor;
    setAnnotationsFor: SetAnnotationsFor;
}) {
    const fieldId = `spell_${entry.id}`;
    return (
        <div className={`spellEntry ${entry.autoImported ? "spellEntry--review" : ""}`}>
            <input type="checkbox" checked={entry.prepared} onChange={(e) => onChange({ prepared: e.target.checked })} title="Preparado" />
            <AnnotatedField
                className="spellEntry__name"
                fieldId={fieldId}
                multiline={false}
                placeholder="Nombre del hechizo"
                value={entry.name}
                onValueChange={(v) => onChange({ name: v, autoImported: false })}
                annotations={annotationsFor(fieldId)}
                onAnnotationsChange={(list) => setAnnotationsFor(fieldId, list)}
            />
            {entry.autoImported && (
                <button type="button" className="spellEntry__reviewBadge" title="Importado de la ficha antigua — clic para confirmar que el nivel es correcto" onClick={() => onChange({ autoImported: false })}>
                    <FontAwesomeIcon icon={faCheck} />
                </button>
            )}
            <button type="button" onClick={onRemove} title="Quitar">
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
}

// ---------- Spell level block ----------
export function SpellLevelBlock({
    level,
    data,
    onChange,
    annotationsFor,
    setAnnotationsFor,
}: {
    level: number;
    data: SpellLevelData;
    onChange: (d: SpellLevelData) => void;
    annotationsFor: AnnotationsFor;
    setAnnotationsFor: SetAnnotationsFor;
}) {
    const addEntry = () => {
        onChange({ ...data, entries: [...data.entries, { id: `lvl${level}_${Date.now()}`, name: "", prepared: false }] });
    };
    const updateEntry = (id: string, patch: Partial<SpellEntry>) => {
        onChange({ ...data, entries: data.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
    };
    const removeEntry = (id: string) => {
        onChange({ ...data, entries: data.entries.filter((e) => e.id !== id) });
    };

    return (
        <div className="spellLevelBlock">
            <div className="spellLevelBlock__header">
                <span className="spellLevelBlock__num">{level}</span>
                <label>
                    Espacios
                    <input type="number" min={0} value={data.slotsTotal} onChange={(e) => onChange({ ...data, slotsTotal: e.target.value })} />
                </label>
                <label>
                    Gastados
                    <input type="number" min={0} value={data.slotsExpended} onChange={(e) => onChange({ ...data, slotsExpended: e.target.value })} />
                </label>
            </div>
            <div className="spellLevelBlock__entries">
                {data.entries.map((entry) => (
                    <SpellEntryRow
                        key={entry.id}
                        entry={entry}
                        onChange={(patch) => updateEntry(entry.id, patch)}
                        onRemove={() => removeEntry(entry.id)}
                        annotationsFor={annotationsFor}
                        setAnnotationsFor={setAnnotationsFor}
                    />
                ))}
                <button type="button" className="spellLevelBlock__add" onClick={addEntry}>
                    <FontAwesomeIcon icon={faPlus} /> Añadir hechizo
                </button>
            </div>
        </div>
    );
}
