// characterSheet/migration.ts
//
// Convierte una ficha guardada por el visor de PDF antiguo (claves = nombres
// de campo de Acrobat) al esquema nuevo. Se ejecuta una sola vez por ficha:
// si content.schemaVersion >= 2 ya no se vuelve a tocar, así que las
// ediciones posteriores del jugador nunca se pisan con datos viejos.
//
// *** Esta lógica también existe, duplicada a propósito y en JS plano, en
// scripts/migrateSheets.mjs para que puedas migrar tú las fichas desde un
// script (tú tienes el service role de Supabase, el jugador no puede
// guardar fichas ajenas desde la web). Si tocas algo aquí, tócalo también
// allí. ***

import { SheetContent, SpellsData, emptySpells, WeaponEntry, SpellEntry, newId } from "./types";

function pick(content: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = content[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return "";
}

function mergePair(content: Record<string, any>, a: string, b: string): string {
  const first = typeof content[a] === "string" ? content[a] : "";
  const second = typeof content[b] === "string" ? content[b] : "";
  return `${first}${second}`.trim();
}

function migrateWeapons(content: Record<string, any>): WeaponEntry[] {
  const defs = [
    { name: ["Wpn Name"], atk: ["Wpn1 AtkBonus"], dmg: ["Wpn1 Damage"] },
    { name: ["Wpn Name 2"], atk: ["Wpn2 AtkBonus ", "Wpn2 AtkBonus"], dmg: ["Wpn2 Damage ", "Wpn2 Damage"] },
    { name: ["Wpn Name 3"], atk: ["Wpn3 AtkBonus  ", "Wpn3 AtkBonus "], dmg: ["Wpn3 Damage  ", "Wpn3 Damage "] },
  ];
  return defs.map((d) => ({
    id: newId("weapon"),
    name: pick(content, d.name),
    atkBonus: pick(content, d.atk),
    damage: pick(content, d.dmg),
  }));
}

/**
 * Orden real de los ~100 campos "Spells 10XX" de la plantilla PDF y en qué
 * tramo cae cada nivel. Se obtuvo colocando un marcador de texto ("ESTO ES
 * NIVEL X") en la primera casilla de cada bloque de nivel en una ficha de
 * prueba y viendo en qué campo aparecía cada uno. El orden fiable NO es el
 * valor numérico del nombre de campo (tiene huecos, p.ej. de 1099 salta a
 * 10100 porque el resto de esos números los usan otros campos del PDF que no
 * son de hechizos), sino el orden ASCENDENTE de esos nombres tal cual
 * existen — que sí coincide con el orden real de las casillas.
 *
 * Límites detectados (índice = posición en la lista ordenada de campos
 * "Spells 10*" que existen realmente en el content, empezando en 0):
 *   índice 0        -> truco (marcador en "Spells 1014")
 *   índice 1..31    -> nivel 1  (marcador en "Spells 1015")
 *   índice 32..33   -> nivel 2  (marcador en "Spells 1046")
 *   índice 34..46   -> nivel 3  (marcador en "Spells 1048")
 *   índice 47..59   -> nivel 4  (marcador en "Spells 1061")
 *   índice 60..68   -> nivel 5  (marcador en "Spells 1074")
 *   índice 69..77   -> nivel 6  (marcador en "Spells 1083")
 *   índice 78..86   -> nivel 7  (marcador en "Spells 1092")
 *   índice 87..93   -> nivel 8  (marcador en "Spells 10101")
 *   índice 94..fin  -> nivel 9  (marcador en "Spells 10108")
 *
 * OJO: el tramo de trucos salió de un solo campo y el de nivel 1 de 31, lo
 * cual no encaja con el aspecto visual de la hoja (la caja de trucos tiene
 * más líneas que la de nivel 1). Cada hechizo importado se marca como
 * "revisar" y se puede reasignar de nivel con un clic desde la pestaña de
 * Hechizos — así que aunque el límite real fuera algo distinto en algún
 * caso raro, no se pierde ningún dato, solo tocaría reclasificar a mano.
 */
const SPELL_LEVEL_BOUNDARIES: { level: number | "cantrip"; startIndex: number }[] = [
  { level: "cantrip", startIndex: 0 },
  { level: 1, startIndex: 1 },
  { level: 2, startIndex: 32 },
  { level: 3, startIndex: 34 },
  { level: 4, startIndex: 47 },
  { level: 5, startIndex: 60 },
  { level: 6, startIndex: 69 },
  { level: 7, startIndex: 78 },
  { level: 8, startIndex: 87 },
  { level: 9, startIndex: 94 },
];

function levelForIndex(index: number): number | "cantrip" {
  let current: number | "cantrip" = "cantrip";
  for (const b of SPELL_LEVEL_BOUNDARIES) {
    if (index >= b.startIndex) current = b.level;
  }
  return current;
}

function migrateSpells(content: Record<string, any>): SpellsData {
  const spells = emptySpells();
  spells.spellcastingClass = pick(content, ["SpellcastingClass", "Spellcasting Class 2"]);
  spells.spellcastingAbility = pick(content, ["SpellcastingAbility", "SpellcastingAbility 2"]);
  spells.saveDC = pick(content, ["SpellSaveDC  2", "SpellSaveDC 2", "SpellSaveDC"]);
  spells.atkBonus = pick(content, ["SpellAtkBonus 2", "SpellAtkBonus"]);

  for (let lvl = 1; lvl <= 9; lvl++) {
    const total = content[`SlotsTotal ${18 + lvl}`];
    const remaining = content[`SlotsRemaining ${18 + lvl}`];
    if (typeof total === "string" && total.trim() !== "") {
      spells.levels[lvl].slotsTotal = total;
      const totalN = parseInt(total, 10);
      const remN = typeof remaining === "string" && remaining.trim() !== "" ? parseInt(remaining, 10) : undefined;
      if (!Number.isNaN(totalN) && remN !== undefined && !Number.isNaN(remN)) {
        spells.levels[lvl].slotsExpended = String(Math.max(0, totalN - remN));
      }
    }
  }

  // Todas las claves "Spells 10*" que existan, ordenadas por su número tal
  // cual aparece (ver comentario del límite arriba: ese orden es el fiable).
  const spellKeys = Object.keys(content)
    .filter((k) => /^Spells 10\d*$/.test(k))
    .sort((a, b) => {
      const na = parseInt(a.replace("Spells ", ""), 10);
      const nb = parseInt(b.replace("Spells ", ""), 10);
      return na - nb;
    });

  spellKeys.forEach((key, index) => {
    const name = content[key];
    if (typeof name !== "string" || name.trim() === "") return;
    const level = levelForIndex(index);
    const entry: SpellEntry = { id: newId("spell"), name: name.trim(), prepared: false, autoImported: true };
    if (level === "cantrip") {
      spells.cantrips.push(entry);
    } else {
      spells.levels[level].entries.push(entry);
    }
  });

  return spells;
}

export function migrateLegacyContent(raw: Record<string, any> | null | undefined): SheetContent {
  const content: Record<string, any> = { ...(raw || {}) };

  if ((content.schemaVersion || 0) >= 2) {
    return content as SheetContent;
  }

  content.Race = pick(content, ["Race", "Race "]);
  content.PersonalityTraits = pick(content, ["PersonalityTraits", "PersonalityTraits "]);

  // Campos partidos en dos por overflow de texto del PDF -> un único campo sin límite.
  content.Equipment = mergePair(content, "Equipment", "Equipment 2") || content.Equipment || "";
  content.AdditionalFeaturesTraits = mergePair(content, "Feat+Traits", "Feat+Traits 2");
  content.Allies = mergePair(content, "Allies", "Allies 2") || content.Allies || "";
  content.Treasure = mergePair(content, "Treasure", "Treasure 2") || content.Treasure || "";
  // "Backstory" es el cuadro propio de la ficha (distinto de la columna `story`
  // aparte en BBDD que ya usabais para la historia real — ese no se toca aquí).
  content.CharacterBackstory = content.Backstory || "";

  content.weapons = migrateWeapons(content);

  // CP/SP/GP/PP son los nombres de campo de monedas de la plantilla PDF
  // original (cobre/plata/oro/platino - el electro (EP) no se usa en la ficha nueva).
  content.Copper = pick(content, ["Copper", "CP"]);
  content.Silver = pick(content, ["Silver", "SP"]);
  content.Gold = pick(content, ["Gold", "GP"]);
  content.Platinum = pick(content, ["Platinum", "PP"]);

  const deathSuccesses = [content["Check Box 12"], content["Check Box 13"], content["Check Box 14"]].filter(Boolean).length;
  const deathFailures = [content["Check Box 15"], content["Check Box 16"], content["Check Box 17"]].filter(Boolean).length;
  content.deathSaves = { successes: deathSuccesses, failures: deathFailures };
  content.Inspiration = Boolean(content.Inspiration);

  content.spells = migrateSpells(content);

  content.annotations = content.annotations && typeof content.annotations === "object" ? content.annotations : {};

  content.schemaVersion = 2;
  return content as SheetContent;
}
