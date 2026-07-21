// characterSheet/types.ts


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
  key: string;
  label: string;
  ability: Ability;
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
  id: string;
  name: string;
  atkBonus: string;
  damage: string;
}

export interface SpellEntry {
  id: string;
  name: string;
  prepared: boolean;
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
  levels: Record<number, SpellLevelData>; 
}

export interface TextAnnotation {
  id: string;
  start: number;
  end: number;
  anchorText: string;
  note: string;
  // Sticky notes omit `kind` (or set it to "note"); inline text formatting
  // (persisted browser bold/italic/underline shortcuts) uses the other kinds.
  kind?: "note" | "bold" | "italic" | "underline";
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number; // 0-3
}


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

  // --- monedas ---
  Copper?: string;
  Silver?: string;
  Gold?: string;
  Platinum?: string;

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
  legacySpellsImportList?: string[];
  annotations?: Record<string, TextAnnotation[]>;
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
