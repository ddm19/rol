import { AbilityRollStats } from "./types";

export const ABILITY_SCORE_COUNT = 6;

export const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const rollAbilityModifier = (score: number): number => Math.floor((score - 10) / 2);

export const formatModifier = (modifier: number): string =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`;

export const roll6d20 = (): number[] =>
  Array.from({ length: ABILITY_SCORE_COUNT }, () => rollDie(20));

export const roll3d6 = (): number[] =>
  Array.from({ length: ABILITY_SCORE_COUNT }, () => rollDie(6) + rollDie(6) + rollDie(6));

export const roll4d6DropLowest = (): number[] =>
  Array.from({ length: ABILITY_SCORE_COUNT }, () => {
    const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
    return dice.slice(1).reduce((sum, value) => sum + value, 0);
  });

export const computeRollStats = (rolls: number[]): AbilityRollStats => {
  if (rolls.length === 0) {
    return { total: 0, mean: 0, min: 0, max: 0, median: 0, modifierTotal: 0 };
  }

  const sorted = [...rolls].sort((a, b) => a - b);
  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const modifierTotal = rolls.reduce((sum, roll) => sum + rollAbilityModifier(roll), 0);

  return {
    total,
    mean: total / rolls.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median,
    modifierTotal,
  };
};
