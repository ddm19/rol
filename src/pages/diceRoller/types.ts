export interface AbilityRollStats {
  total: number;
  mean: number;
  min: number;
  max: number;
  median: number;
  modifierTotal: number;
}

export type AdjustmentAction = "add" | "subtract" | null;

export interface AbilityAdjustment {
  action: AdjustmentAction;
  delta: number;
}
