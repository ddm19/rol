import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import { abilityMod, fmtMod, SkillDef, WeaponEntry, SpellEntry, SpellLevelData, TextAnnotation } from "../types";
import AnnotatedField from "./AnnotatedField";
import { Tooltip } from "@mui/material";

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
    extra,
}: {
    label: string;
    score: string;
    savePROF: boolean;
    profBonus: number;
    onScoreChange: (v: string) => void;
    onSaveProfChange: (v: boolean) => void;
    extra?: ReactNode;
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
            {extra && <div className="abilityBox__extra">{extra}</div>}
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
    expertise,
    onExpertiseChange,
}: {
    def: SkillDef;
    score: string;
    proficient: boolean;
    profBonus: number;
    onProfChange: (v: boolean) => void;
    expertise: boolean;
    onExpertiseChange: (v: boolean) => void;
}) {
    const mod = abilityMod(score) + (proficient ? profBonus * (expertise ? 2 : 1) : 0);
    const profId = `skill_${def.key}_prof`;
    return (
        <div className="skillRow">
            <input id={profId} type="checkbox" checked={proficient} onChange={(e) => onProfChange(e.target.checked)} />
            {proficient && (
                <span className="skillRow__expertiseWrap">
                    <input
                        type="checkbox"
                        className="skillRow__expertise"
                        checked={expertise}
                        onChange={(e) => onExpertiseChange(e.target.checked)}
                        title="Pericia (Expertise): duplica el bono de competencia"
                    />
                </span>
            )}
            <label htmlFor={profId} className="skillRow__body">
                <span className="skillRow__mod">{fmtMod(mod)}</span>
                <span className="skillRow__label">{def.label}</span>
                {/*                 <span className="skillRow__ability">({def.ability})</span>
 */}            </label>
        </div>
    );
}

// ---------- Weapon / attack row ----------
export function WeaponRow({
    weapon,
    onChange,
    onRemove,
    annotationsFor,
    setAnnotationsFor,
}: {
    weapon: WeaponEntry;
    onChange: (w: WeaponEntry) => void;
    onRemove?: () => void;
    annotationsFor: AnnotationsFor;
    setAnnotationsFor: SetAnnotationsFor;
}) {
    const id = weapon.id;
    return (
        <div className="weaponRow">
            <AnnotatedField
                fieldId={`weapon_${id}_name`}
                multiline={false}
                placeholder="Nombre"
                value={weapon.name}
                onValueChange={(v) => onChange({ ...weapon, name: v })}
                annotations={annotationsFor(`weapon_${id}_name`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${id}_name`, list)}
            />
            <AnnotatedField
                fieldId={`weapon_${id}_atk`}
                multiline={false}
                placeholder="Bono ataque"
                value={weapon.atkBonus}
                onValueChange={(v) => onChange({ ...weapon, atkBonus: v })}
                annotations={annotationsFor(`weapon_${id}_atk`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${id}_atk`, list)}
            />
            <AnnotatedField
                fieldId={`weapon_${id}_dmg`}
                multiline={false}
                placeholder="Daño/Tipo"
                value={weapon.damage}
                onValueChange={(v) => onChange({ ...weapon, damage: v })}
                annotations={annotationsFor(`weapon_${id}_dmg`)}
                onAnnotationsChange={(list) => setAnnotationsFor(`weapon_${id}_dmg`, list)}
            />
            {onRemove && (
                <button type="button" onClick={onRemove} title="Quitar arma">
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
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
                <Tooltip title="Este hechizo se ha importado automáticamente de la ficha antigua, confirma si este hechizo pertenece a este nivel o elimínalo y crea uno nuevo. Solo necesitarás hacer esto 1 vez.">
                    <button type="button" className="spellEntry__reviewBadge" title="Importado de la ficha antigua — clic para confirmar que el nivel es correcto" onClick={() => onChange({ autoImported: false })}>
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                </Tooltip>

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
                    <span className="spellLevelBlock__controlButton" onClick={() => onChange({ ...data, slotsExpended: String(Math.max(0, (parseInt(data.slotsExpended, 10) || 0) - 1)) })} ><FontAwesomeIcon icon={faMinus} /></span>
                    <input type="number" min={0} value={data.slotsExpended} onChange={(e) => onChange({ ...data, slotsExpended: e.target.value })} />
                    <span className="spellLevelBlock__controlButton" onClick={() => onChange({ ...data, slotsExpended: String(parseInt(data.slotsExpended, 10) + 1) })}><FontAwesomeIcon icon={faPlus} /></span>
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
