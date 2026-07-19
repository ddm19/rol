#!/usr/bin/env node
// characterSheet/scripts/migrateSheets.mjs
//
// Migra TODAS las fichas de la tabla `sheets` al esquema nuevo, directamente
// contra Supabase, sin pasar por la web ni por el jugador. Pensado para que
// lo ejecutes tú (necesitas el service role key, que salta la RLS de "solo
// el dueño puede guardar su ficha").
//
// Uso:
//   npm install @supabase/supabase-js
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx node migrateSheets.mjs --dry-run
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx node migrateSheets.mjs
//
// --dry-run: no escribe nada, solo imprime qué haría con cada ficha.
//
// *** La lógica de migración de aquí es una copia deliberada, en JS plano,
// de characterSheet/migration.ts (el mismo código que usa el cliente para
// las fichas que aún no hayas migrado tú). Si cambias una, cambia la otra. ***

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function pick(content, keys) {
    for (const k of keys) {
        const v = content[k];
        if (typeof v === "string" && v.trim() !== "") return v;
    }
    return "";
}

function mergePair(content, a, b) {
    const first = typeof content[a] === "string" ? content[a] : "";
    const second = typeof content[b] === "string" ? content[b] : "";
    return `${first}${second}`.trim();
}

function migrateWeapons(content) {
    const defs = [
        { name: ["Wpn Name"], atk: ["Wpn1 AtkBonus"], dmg: ["Wpn1 Damage"] },
        { name: ["Wpn Name 2"], atk: ["Wpn2 AtkBonus ", "Wpn2 AtkBonus"], dmg: ["Wpn2 Damage ", "Wpn2 Damage"] },
        { name: ["Wpn Name 3"], atk: ["Wpn3 AtkBonus  ", "Wpn3 AtkBonus "], dmg: ["Wpn3 Damage  ", "Wpn3 Damage "] },
    ];
    return defs.map((d) => ({ name: pick(content, d.name), atkBonus: pick(content, d.atk), damage: pick(content, d.dmg) }));
}

// Ver characterSheet/migration.ts para la explicación completa de estos límites.
const SPELL_LEVEL_BOUNDARIES = [
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

function levelForIndex(index) {
    let current = "cantrip";
    for (const b of SPELL_LEVEL_BOUNDARIES) {
        if (index >= b.startIndex) current = b.level;
    }
    return current;
}

let idCounter = 0;
const newId = (prefix) => `${prefix}_${Date.now()}_${(idCounter++).toString(36)}`;

function emptySpellLevel() {
    return { slotsTotal: "", slotsExpended: "", entries: [] };
}

function emptySpells() {
    const levels = {};
    for (let i = 1; i <= 9; i++) levels[i] = emptySpellLevel();
    return { spellcastingClass: "", spellcastingAbility: "", saveDC: "", atkBonus: "", cantrips: [], levels };
}

function migrateSpells(content) {
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

    const spellKeys = Object.keys(content)
        .filter((k) => /^Spells 10\d*$/.test(k))
        .sort((a, b) => parseInt(a.replace("Spells ", ""), 10) - parseInt(b.replace("Spells ", ""), 10));

    spellKeys.forEach((key, index) => {
        const name = content[key];
        if (typeof name !== "string" || name.trim() === "") return;
        const level = levelForIndex(index);
        const entry = { id: newId("spell"), name: name.trim(), prepared: false, autoImported: true };
        if (level === "cantrip") spells.cantrips.push(entry);
        else spells.levels[level].entries.push(entry);
    });

    return spells;
}

function migrateLegacyContent(raw) {
    const content = { ...(raw || {}) };
    if ((content.schemaVersion || 0) >= 2) return { content, changed: false };

    content.Race = pick(content, ["Race", "Race "]);
    content.PersonalityTraits = pick(content, ["PersonalityTraits", "PersonalityTraits "]);
    content.Equipment = mergePair(content, "Equipment", "Equipment 2") || content.Equipment || "";
    content.AdditionalFeaturesTraits = mergePair(content, "Feat+Traits", "Feat+Traits 2");
    content.Allies = mergePair(content, "Allies", "Allies 2") || content.Allies || "";
    content.Treasure = mergePair(content, "Treasure", "Treasure 2") || content.Treasure || "";
    content.CharacterBackstory = content.Backstory || "";

    content.weapons = migrateWeapons(content);

    const deathSuccesses = [content["Check Box 12"], content["Check Box 13"], content["Check Box 14"]].filter(Boolean).length;
    const deathFailures = [content["Check Box 15"], content["Check Box 16"], content["Check Box 17"]].filter(Boolean).length;
    content.deathSaves = { successes: deathSuccesses, failures: deathFailures };
    content.Inspiration = Boolean(content.Inspiration);

    content.spells = migrateSpells(content);
    content.annotations = content.annotations && typeof content.annotations === "object" ? content.annotations : {};
    content.schemaVersion = 2;

    return { content, changed: true };
}

async function main() {
    console.log(DRY_RUN ? "=== DRY RUN (no se escribe nada) ===" : "=== MIGRACIÓN REAL ===");

    let from = 0;
    const pageSize = 200;
    let totalSeen = 0;
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Ajusta el nombre de columnas si tu tabla real difiere (id, owner, content).
    while (true) {
        const { data: rows, error } = await supabase.from("sheets").select("id, owner, content, deleted").range(from, from + pageSize - 1);
        if (error) {
            console.error("Error leyendo fichas:", error.message);
            process.exit(1);
        }
        if (!rows || rows.length === 0) break;

        for (const row of rows) {
            totalSeen++;
            if (row.deleted) {
                totalSkipped++;
                continue;
            }
            try {
                const { content, changed } = migrateLegacyContent(row.content || {});
                if (!changed) {
                    totalSkipped++;
                    continue;
                }
                console.log(`Ficha "${row.id}" (owner ${row.owner}): ${row.content?.CharacterName || "(sin nombre)"} -> migrando`);
                if (!DRY_RUN) {
                    const { error: upErr } = await supabase.from("sheets").update({ content }).eq("id", row.id).eq("owner", row.owner);
                    if (upErr) throw upErr;
                }
                totalMigrated++;
            } catch (err) {
                totalErrors++;
                console.error(`  ! Error migrando "${row.id}" (owner ${row.owner}):`, err.message || err);
            }
        }

        from += pageSize;
    }

    console.log("\n--- Resumen ---");
    console.log(`Fichas vistas: ${totalSeen}`);
    console.log(`Migradas: ${totalMigrated}`);
    console.log(`Ya estaban al día / borradas: ${totalSkipped}`);
    console.log(`Errores: ${totalErrors}`);
    if (DRY_RUN) console.log("\n(Era un --dry-run: no se ha escrito nada. Repite sin --dry-run para aplicar.)");
}

main();
