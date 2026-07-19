// characterSheet/types.ts
//
// El "content" que se guarda en `sheets.content` (jsonb) nace del PDF fillable
// antiguo, así que muchas claves son literalmente los nombres de campo del PDF
// (con espacios sueltos incluidos, ej. "Race "). Para no tener que migrar la
// base de datos, el formulario nuevo REUTILIZA esas claves cuando son fiables
// (scores, prof-bonus, proficiencias de skill/salvación) y solo introduce
// claves nuevas y limpias donde el campo antiguo era ambiguo, estaba partido
// en dos por overflow de texto del PDF, o dependía de la numeración interna
// de Acrobat (los hechizos). Ver migration.ts para el detalle.

export type Ability = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export const ABILITIES: { key: Ability; label: string }[] = [
  { key: "STR", label: "Fuerza" },
  { key: "DEX", label: "Destreza" },
  { key: "CON", label: "Constitución" },
  { key: "INT", label: "Inteligencia" },
  { key: "WIS", label: "Sabiduría" },
  { key: "CHA", label: "Carisma" },
];

export interface SkillDef {
  /** También es la clave heredada donde el PDF guardaba el modificador ya calculado (ya no se usa como fuente de verdad, se recalcula en vivo). */
  key: string;
  label: string;
  ability: Ability;
  /** Clave heredada del booleano de competencia — se sigue usando tal cual. */
  profKey: string;
}

export const SKILLS: SkillDef[] = [
  { key: "Acrobatics", label: "Acrobacias", ability: "DEX", profKey: "acroPROF" },
  { key: "AnHan", label: "Trato con Animales", ability: "WIS", profKey: "anhanPROF" },
  { key: "Arcana", label: "Conocimiento Arcano", ability: "INT", profKey: "arcanaPROF" },
  { key: "Athletics", label: "Atletismo", ability: "STR", profKey: "athPROF" },
  { key: "Deception", label: "Engaño", ability: "CHA", profKey: "decepPROF" },
  { key: "History", label: "Historia", ability: "INT", profKey: "histPROF" },
  { key: "Insight", label: "Perspicacia", ability: "WIS", profKey: "insightPROF" },
  { key: "Intimidation", label: "Intimidación", ability: "CHA", profKey: "intimPROF" },
  { key: "Investigation", label: "Investigación", ability: "INT", profKey: "investPROF" },
  { key: "Medicine", label: "Medicina", ability: "WIS", profKey: "medPROF" },
  { key: "Nature", label: "Naturaleza", ability: "INT", profKey: "naturePROF" },
  { key: "Perception", label: "Percepción", ability: "WIS", profKey: "perPROF" },
  { key: "Performance", label: "Interpretación", ability: "CHA", profKey: "perfPROF" },
  { key: "Persuasion", label: "Persuasión", ability: "CHA", profKey: "persPROF" },
  { key: "Religion", label: "Religión", ability: "INT", profKey: "religPROF" },
  { key: "SleightofHand", label: "Juego de Manos", ability: "DEX", profKey: "sohPROF" },
  { key: "Stealth", label: "Sigilo", ability: "DEX", profKey: "stealthPROF" },
  { key: "Survival", label: "Supervivencia", ability: "WIS", profKey: "survPROF" },
];

export interface WeaponEntry {
  name: string;
  atkBonus: string;
  damage: string;
}

export interface SpellEntry {
  id: string;
  name: string;
  prepared: boolean;
  /** true si se coló aquí automáticamente al migrar la ficha antigua — se le muestra un aviso para que se revise una vez, y desaparece al confirmarlo o al editar el nombre. */
  autoImported?: boolean;
}

export interface SpellLevelData {
  slotsTotal: string;
  slotsExpended: string;
  entries: SpellEntry[];
}

export interface SpellsData {
  spellcastingClass: string;
  spellcastingAbility: string;
  saveDC: string;
  atkBonus: string;
  cantrips: SpellEntry[];
  levels: Record<number, SpellLevelData>; // keys 1..9
}

/** Una nota "flotante" anclada a un tramo de texto dentro de un campo (como un comentario de PDF). */
export interface TextAnnotation {
  id: string;
  start: number;
  end: number;
  /** Foto del texto anclado en el momento de crear/editar la nota, para detectar si se ha desincronizado. */
  anchorText: string;
  note: string;
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number; // 0-3
}

/**
 * Forma "limpia" del contenido que usa el formulario nuevo.
 * Convive con el resto de claves heredadas que seguimos reutilizando
 * directamente (scores, PROF booleans, saves...) mediante índice abierto.
 */
export interface SheetContent {
  // --- cabecera ---
  CharacterName?: string;
  ClassLevel?: string;
  Background?: string;
  PlayerName?: string;
  Race?: string;
  Alignment?: string;
  XP?: string;

  // --- combate ---
  AC?: string;
  Initiative?: string;
  Speed?: string;
  HPMax?: string;
  HPCurrent?: string;
  HPTemp?: string;
  HD?: string;
  HDTotal?: string;
  ProfBonus?: string;
  Inspiration?: boolean;
  deathSaves?: DeathSaves;
  weapons?: WeaponEntry[];

  // --- rasgos físicos (página 2) ---
  Age?: string;
  Height?: string;
  Weight?: string;
  Eyes?: string;
  Skin?: string;
  Hair?: string;

  // --- texto libre ---
  Equipment?: string;
  "Features and Traits"?: string;
  ProficienciesLang?: string;
  CharacterAppearance?: string;
  Allies?: string;
  "Name group"?: string;
  AdditionalFeaturesTraits?: string;
  CharacterBackstory?: string;
  Treasure?: string;
  PersonalityTraits?: string;
  Ideals?: string;
  Bonds?: string;
  Flaws?: string;

  // --- hechizos ---
  spells?: SpellsData;
  /** Nombres de hechizo detectados en una ficha antigua que aún no se han re-clasificado. */
  legacySpellsImportList?: string[];

  // --- QOL: notas ancladas a un fragmento de texto concreto (como un comentario de PDF) ---
  // Varias por campo, no se solapan entre sí. `anchorText` es una foto del texto en el
  // momento de crear la nota: si el texto del campo cambia y ese fragmento ya no coincide
  // en esa posición, la nota pasa a "huérfana" (se conserva, pero deja de mostrarse flotando).
  annotations?: Record<string, TextAnnotation[]>;

  // --- otros ya existentes, sin tocar ---
  inventory?: string;
  magicItems?: unknown[];
  avatarUrl?: string;

  schemaVersion?: number;

  [legacyKey: string]: any;
}

export const emptySpellLevel = (): SpellLevelData => ({
  slotsTotal: "",
  slotsExpended: "",
  entries: [],
});

export const emptySpells = (): SpellsData => ({
  spellcastingClass: "",
  spellcastingAbility: "",
  saveDC: "",
  atkBonus: "",
  cantrips: [],
  levels: {
    1: emptySpellLevel(),
    2: emptySpellLevel(),
    3: emptySpellLevel(),
    4: emptySpellLevel(),
    5: emptySpellLevel(),
    6: emptySpellLevel(),
    7: emptySpellLevel(),
    8: emptySpellLevel(),
    9: emptySpellLevel(),
  },
});

export const abilityMod = (score: string | number | undefined): number => {
  const n = typeof score === "string" ? parseInt(score, 10) : score;
  if (n === undefined || Number.isNaN(n)) return 0;
  return Math.floor((n - 10) / 2);
};

export const fmtMod = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

let noteIdCounter = 0;
export const newId = (prefix: string): string => `${prefix}_${Date.now()}_${(noteIdCounter++).toString(36)}`;
